// Shared business rule checks for match teams and team rosters (see docs/BusinessRules.md).
// Each check throws a RuleError, which routes turn into a 4xx response with handleRuleError.

const TEAMS_PER_MATCH = 2;
const TEAM_POSITIONS = ['Player', 'Captain', 'Substitute'];

// Roster shape: up to 6 members. A full lineup (needed to compete) is a Captain + 4 Players;
// the Substitute is optional.
const POSITION_LIMITS = { Captain: 1, Player: 4, Substitute: 1 };
const LINEUP_PLAYERS = 4;
const UNIQUE_VIOLATION = '23505';
const FK_VIOLATION = '23503';

const { hasRole, isAdmin } = require('../middleware/auth');

class RuleError extends Error {
	constructor(status, message) {
		super(message);
		this.status = status;
	}
}

// Sends the RuleError (or a race caught by a unique index) as a client error. Returns null if it's neither.
function handleRuleError(error, res) {

	if (error instanceof RuleError) {
		return res.status(error.status).json({ error: error.message });
	}

	if (error.code === UNIQUE_VIOLATION && error.constraint === 'uq_active_team_member') {
		return res.status(409).json({ error: "Member is already on a team" });
	}

	if (error.code === UNIQUE_VIOLATION && error.constraint === 'uq_team_captain') {
		return res.status(409).json({ error: "This team already has a captain" });
	}

	if (error.code === UNIQUE_VIOLATION && error.constraint === 'uq_session_team') {
		return res.status(409).json({ error: "Team is already in this match" });
	}

	if (error.code === UNIQUE_VIOLATION && error.constraint === 'uq_team_substitute') {
		return res.status(409).json({ error: "This team already has a substitute" });
	}

	if (error.code === UNIQUE_VIOLATION && error.constraint === 'uq_active_team_manager') {
		return res.status(409).json({ error: "This user already manages a team" });
	}

	if (error.code === UNIQUE_VIOLATION && error.constraint === 'uq_event_team') {
		return res.status(409).json({ error: "Team is already registered for this event" });
	}

	return null;
}


// Deleting a record that history still points at (rosters, matches, roles) fails on the foreign keys.
// Turns that into a 409 that points to deactivating instead. Returns null for any other error.
function handleInUseError(error, res, entity) {

	if (error.code !== FK_VIOLATION) return null;

	return res.status(409).json({
		error: `This ${entity} has history on the platform and can't be deleted. Deactivate it instead`
	});
}


// A team can't be deactivated while it still has matches to play
async function assertCanDeactivateTeam(db, teamId) {

	const result = await db.query(
		`
		SELECT COUNT(*)::INT AS pending
		FROM session_teams st
		JOIN sessions s
			ON st.session_id = s.session_id
		WHERE st.team_id = $1
			AND s.status IN ('Upcoming', 'In-Progress')
		`,
		[teamId]
	);

	const { pending } = result.rows[0];

	if (pending > 0) {
		throw new RuleError(409, `Team still has ${pending} upcoming or live match${pending === 1 ? '' : 'es'}. Remove it from ${pending === 1 ? 'that match' : 'those matches'} first`);
	}
}


// A match is played by exactly two different teams
function parseMatchTeamIds(teamIds) {

	if (!Array.isArray(teamIds) || teamIds.length !== TEAMS_PER_MATCH) {
		throw new RuleError(400, `A match must have exactly ${TEAMS_PER_MATCH} teams`);
	}

	const ids = teamIds.map(Number);

	if (ids.some(teamId => !Number.isInteger(teamId))) {
		throw new RuleError(400, "Team IDs must be numbers");
	}

	if (new Set(ids).size !== ids.length) {
		throw new RuleError(400, "A team cannot play against itself");
	}

	return ids;
}


// Matches can't be edited once completed; subject names what was being changed
async function assertSessionEditable(db, sessionId, subject = "Teams") {

	const result = await db.query(
		`SELECT status FROM sessions WHERE session_id = $1`,
		[sessionId]
	);

	if (result.rows.length === 0) {
		throw new RuleError(404, `Could not find Session ID: ${sessionId}`);
	}

	if (result.rows[0].status === 'Completed') {
		throw new RuleError(400, `${subject} cannot be changed on a completed match`);
	}
}


// Every team must exist, be active, be registered for the match's event, and not already be
// playing another match at an overlapping time. One query for all teams: the lateral join finds
// the first clashing match per team.
async function assertTeamsCanPlay(db, sessionId, teamIds) {

	const result = await db.query(
		`
		SELECT
			t.team_id,
			t.team_name,
			COALESCE(t.is_active, TRUE) AS is_active,
			EXISTS (
				SELECT 1
				FROM event_teams et
				WHERE et.event_id = cur.event_id
					AND et.team_id = t.team_id
			) AS is_registered,
			lineup.captains,
			lineup.players,
			clash.session_id AS clash_session_id

		FROM teams t

		CROSS JOIN (
			SELECT event_id, scheduled_start, scheduled_end, status
			FROM sessions
			WHERE session_id = $2
		) cur

		LEFT JOIN LATERAL (
			SELECT s.session_id
			FROM session_teams st
			JOIN sessions s
				ON st.session_id = s.session_id
			WHERE st.team_id = t.team_id
				AND st.session_id <> $2
				AND s.status <> 'Cancelled'
				AND cur.status <> 'Cancelled'
				AND s.scheduled_start < cur.scheduled_end
				AND s.scheduled_end > cur.scheduled_start
			LIMIT 1
		) clash ON TRUE

		-- Current lineup, to make sure each team can field a full squad
		CROSS JOIN LATERAL (
			SELECT
				COUNT(*) FILTER (WHERE tm.team_position = 'Captain')::INT AS captains,
				COUNT(*) FILTER (WHERE tm.team_position = 'Player')::INT AS players
			FROM team_members tm
			WHERE tm.team_id = t.team_id
				AND tm.end_date IS NULL
		) lineup

		WHERE t.team_id = ANY($1::int[])
		`,
		[teamIds, sessionId]
	);

	if (result.rows.length !== teamIds.length) {
		const found = new Set(result.rows.map(row => row.team_id));
		throw new RuleError(404, `Could not find Team ID: ${teamIds.find(teamId => !found.has(teamId))}`);
	}

	for (const team of result.rows) {

		if (!team.is_active) {
			throw new RuleError(400, `${team.team_name} is inactive and cannot be added to a match`);
		}

		assertFullLineup(team.team_name, team.captains, team.players);

		if (!team.is_registered) {
			throw new RuleError(400, `${team.team_name} is not registered for this event`);
		}

		if (team.clash_session_id) {
			throw new RuleError(409, `${team.team_name} is already playing match #${team.clash_session_id} at that time`);
		}
	}
}


// A match has to be scheduled inside its event's start and end
async function assertWithinEvent(db, sessionId) {

	const result = await db.query(
		`
		SELECT
			e.event_name,
			s.scheduled_start >= e.start_on AND s.scheduled_end <= e.end_on AS fits
		FROM sessions s
		JOIN events e
			ON s.event_id = e.event_id
		WHERE s.session_id = $1
		`,
		[sessionId]
	);

	if (result.rows.length > 0 && !result.rows[0].fits) {
		throw new RuleError(400, `Match must be scheduled within ${result.rows[0].event_name}'s start and end dates`);
	}
}


// The reverse check for event edits: new event dates can't leave any of its matches outside them
async function assertEventFitsMatches(db, eventId) {

	const result = await db.query(
		`
		SELECT COUNT(*)::INT AS outside
		FROM sessions s
		JOIN events e
			ON s.event_id = e.event_id
		WHERE e.event_id = $1
			AND (s.scheduled_start < e.start_on OR s.scheduled_end > e.end_on)
		`,
		[eventId]
	);

	const { outside } = result.rows[0];

	if (outside > 0) {
		throw new RuleError(400, `${outside} match${outside === 1 ? ' is' : 'es are'} scheduled outside these dates. Move ${outside === 1 ? 'it' : 'them'} first`);
	}
}


// An event can only be completed once none of its matches are still waiting to be played
async function assertEventCanComplete(db, eventId) {

	const result = await db.query(
		`
		SELECT COUNT(*)::INT AS pending
		FROM sessions
		WHERE event_id = $1
			AND status IN ('Upcoming', 'In-Progress')
		`,
		[eventId]
	);

	const { pending } = result.rows[0];

	if (pending > 0) {
		throw new RuleError(400, `${pending} match${pending === 1 ? ' is' : 'es are'} still upcoming or in progress. Complete or cancel ${pending === 1 ? 'it' : 'them'} first`);
	}
}


// A match can only be completed once both teams have a score (no winner is allowed, for draws)
async function assertHasResults(db, sessionId) {

	const result = await db.query(
		`
		SELECT
			COUNT(*)::INT AS teams,
			COUNT(md.score)::INT AS scored
		FROM session_teams st
		LEFT JOIN match_details md
			ON st.session_id = md.session_id
			AND st.team_id = md.team_id
		WHERE st.session_id = $1
		`,
		[sessionId]
	);

	const { teams, scored } = result.rows[0];

	if (teams < TEAMS_PER_MATCH || scored < teams) {
		throw new RuleError(400, "Enter a score for both teams before marking the match Completed");
	}
}


// Replaces a match's teams. Teams that stay keep their results; removed teams lose theirs (FK cascade).
async function setMatchTeams(db, sessionId, teamIds) {

	await db.query(
		`DELETE FROM session_teams WHERE session_id = $1 AND team_id <> ALL($2::int[])`,
		[sessionId, teamIds]
	);

	await db.query(
		`
		INSERT INTO session_teams (session_id, team_id)
		SELECT $1, unnest($2::int[])
		ON CONFLICT (session_id, team_id) DO NOTHING
		`,
		[sessionId, teamIds]
	);
}


// Teams can only register for an event that hasn't finished, and only while active
async function assertCanRegister(db, eventId, teamId) {

	const result = await db.query(
		`
		SELECT
			(SELECT status FROM events WHERE event_id = $1) AS event_status,
			(SELECT COALESCE(is_active, TRUE) FROM teams WHERE team_id = $2) AS team_active,
			(SELECT team_name FROM teams WHERE team_id = $2) AS team_name,
			COUNT(tm.team_member_id) FILTER (WHERE tm.team_position = 'Captain')::INT AS captains,
			COUNT(tm.team_member_id) FILTER (WHERE tm.team_position = 'Player')::INT AS players
		FROM (SELECT 1) AS one
		LEFT JOIN team_members tm
			ON tm.team_id = $2
			AND tm.end_date IS NULL
		`,
		[eventId, teamId]
	);

	const { event_status, team_active, team_name, captains, players } = result.rows[0];

	if (event_status === null) throw new RuleError(404, `Could not find Event ID: ${eventId}`);
	if (team_active === null) throw new RuleError(404, `Could not find Team ID: ${teamId}`);
	if (event_status === 'Completed' || event_status === 'Cancelled') {
		throw new RuleError(400, `Teams cannot register for a ${event_status.toLowerCase()} event`);
	}
	if (!team_active) throw new RuleError(400, "Inactive teams cannot register for an event");
	assertFullLineup(team_name, captains, players);
}


// A team can only leave an event it hasn't been scheduled to play in yet
async function assertCanUnregister(db, eventId, teamId) {

	const result = await db.query(
		`
		SELECT COUNT(*)::INT AS match_count
		FROM session_teams st
		JOIN sessions s
			ON st.session_id = s.session_id
		WHERE s.event_id = $1
			AND st.team_id = $2
		`,
		[eventId, teamId]
	);

	const { match_count } = result.rows[0];

	if (match_count > 0) {
		throw new RuleError(409, `Team is in ${match_count} match${match_count === 1 ? '' : 'es'} for this event. Remove it from those first`);
	}
}


// A team needs a Captain and 4 Players before it can register for events or play matches
function assertFullLineup(teamName, captains, players) {

	if (captains < 1 || players < LINEUP_PLAYERS) {
		throw new RuleError(400, `${teamName} needs a Captain and ${LINEUP_PLAYERS} Players to compete (has ${captains} Captain, ${players} Players)`);
	}
}


// A member can join a team only if both are active, the member isn't on a team already,
// and that position still has room (1 Captain, 4 Players, 1 Substitute). Checked in one query.
// Callers adding to a roster should lock the team row first (SELECT ... FOR UPDATE) so two
// requests can't both take the last open spot.
async function assertCanJoinTeam(db, teamId, memberId, teamPosition) {

	if (!TEAM_POSITIONS.includes(teamPosition)) {
		throw new RuleError(400, `Team position must be one of: ${TEAM_POSITIONS.join(', ')}`);
	}

	const result = await db.query(
		`
		SELECT
			(SELECT COALESCE(is_active, TRUE) FROM teams WHERE team_id = $1) AS team_active,
			(SELECT is_active FROM members WHERE member_id = $2) AS member_active,
			(
				SELECT t.team_name
				FROM team_members tm
				JOIN teams t
					ON tm.team_id = t.team_id
				WHERE tm.member_id = $2
					AND tm.end_date IS NULL
			) AS current_team,
			(
				SELECT COUNT(*)::INT
				FROM team_members
				WHERE team_id = $1
					AND team_position = $3
					AND end_date IS NULL
			) AS position_count
		`,
		[teamId, memberId, teamPosition]
	);

	const { team_active, member_active, current_team, position_count } = result.rows[0];

	if (team_active === null) throw new RuleError(404, `Could not find Team ID: ${teamId}`);
	if (member_active === null) throw new RuleError(404, `Could not find Member ID: ${memberId}`);
	if (!team_active) throw new RuleError(400, "Players cannot be added to an inactive team");
	if (!member_active) throw new RuleError(400, "Inactive members cannot be added to a team");
	if (current_team) throw new RuleError(409, `Member is already on ${current_team}`);
	if (position_count >= POSITION_LIMITS[teamPosition]) {
		const limit = POSITION_LIMITS[teamPosition];
		throw new RuleError(409, `This team already has ${limit === 1 ? 'a' : limit} ${teamPosition.toLowerCase()}${limit === 1 ? '' : 's'}`);
	}
}


// ---- Role and manager assignment (Admin-only routes) -------------------------

// New role set for a user. Guards against locking everyone out: an Admin can't remove their
// own Admin role, and the last active Admin can't lose it. Returns the role names being granted.
async function assertCanSetRoles(db, actor, userId, roleIds) {

	if (!Array.isArray(roleIds) || roleIds.some(roleId => !Number.isInteger(roleId))) {
		throw new RuleError(400, "role_ids must be a list of role IDs");
	}

	const result = await db.query(
		`
		SELECT
			(SELECT COUNT(*)::INT FROM users WHERE user_id = $1) AS user_exists,
			ARRAY(SELECT role_name FROM roles WHERE role_id = ANY($2::int[])) AS new_roles,
			(SELECT COUNT(*)::INT FROM roles WHERE role_id = ANY($2::int[])) AS found,
			EXISTS (
				SELECT 1
				FROM user_roles ur
				JOIN roles r ON ur.role_id = r.role_id
				WHERE ur.user_id = $1 AND r.role_name = 'Admin'
			) AS is_admin_now,
			(
				SELECT COUNT(*)::INT
				FROM user_roles ur
				JOIN roles r ON ur.role_id = r.role_id
				JOIN users u ON ur.user_id = u.user_id
				WHERE r.role_name = 'Admin' AND u.is_active AND u.user_id <> $1
			) AS other_admins
		`,
		[userId, roleIds]
	);

	const { user_exists, new_roles, found, is_admin_now, other_admins } = result.rows[0];

	if (!user_exists) throw new RuleError(404, `Could not find User ID: ${userId}`);
	if (found !== new Set(roleIds).size) throw new RuleError(400, "One or more roles don't exist");

	const losesAdmin = is_admin_now && !new_roles.includes('Admin');

	if (losesAdmin && actor.user_id === userId) {
		throw new RuleError(400, "You can't remove your own Admin role");
	}

	if (losesAdmin && other_admins === 0) {
		throw new RuleError(400, "This is the last active Admin, so the Admin role can't be removed");
	}

	return new_roles;
}


// A team can be assigned to a user who has the Team Manager role, and only if no one else
// is managing it right now (one manager per team, one team per manager)
async function assertCanAssignTeam(db, userId, teamId) {

	const result = await db.query(
		`
		SELECT
			EXISTS (
				SELECT 1
				FROM user_roles ur
				JOIN roles r ON ur.role_id = r.role_id
				WHERE ur.user_id = $1 AND r.role_name = 'Team Manager'
			) AS is_manager,
			(SELECT COALESCE(is_active, TRUE) FROM teams WHERE team_id = $2) AS team_active,
			(
				SELECT CONCAT_WS(' ', u.first_name, u.last_name)
				FROM team_users tu
				JOIN users u ON tu.user_id = u.user_id
				WHERE tu.team_id = $2 AND tu.end_date IS NULL AND tu.user_id <> $1
			) AS other_manager
		`,
		[userId, teamId]
	);

	const { is_manager, team_active, other_manager } = result.rows[0];

	if (!is_manager) throw new RuleError(400, "Give this user the Team Manager role before assigning a team");
	if (team_active === null) throw new RuleError(404, `Could not find Team ID: ${teamId}`);
	if (!team_active) throw new RuleError(400, "Inactive teams can't be assigned a manager");
	if (other_manager) throw new RuleError(409, `This team is already managed by ${other_manager}`);
}


// Ends a manager's current team assignment (kept as history, like rosters)
async function endTeamAssignment(db, userId) {

	await db.query(
		`
		UPDATE team_users
		SET end_date = GREATEST(start_date, CURRENT_DATE)
		WHERE user_id = $1
			AND end_date IS NULL
		`,
		[userId]
	);
}


// ---- Ownership checks (see docs/RBAC.md) ------------------------------------
// Roles say what KIND of thing you can do; these say WHICH records you can do it to.
// Each throws a 403 RuleError, or a 404 if the record doesn't exist. Admin always passes.

// Organizers manage only the events they created
async function assertCanManageEvent(db, user, eventId) {

	if (isAdmin(user)) return;

	if (!hasRole(user, 'Organizer')) {
		throw new RuleError(403, "Only Organizers and Admins can manage events");
	}

	const result = await db.query(`SELECT created_by FROM events WHERE event_id = $1`, [eventId]);

	if (result.rows.length === 0) throw new RuleError(404, `Could not find Event ID: ${eventId}`);

	if (result.rows[0].created_by !== user.user_id) {
		throw new RuleError(403, "You can only manage events you created");
	}
}


// A match belongs to its event, so whoever manages the event manages its matches
async function assertCanManageMatch(db, user, sessionId) {

	if (isAdmin(user)) return;

	const result = await db.query(`SELECT event_id FROM sessions WHERE session_id = $1`, [sessionId]);

	if (result.rows.length === 0) throw new RuleError(404, `Could not find Session ID: ${sessionId}`);

	await assertCanManageEvent(db, user, result.rows[0].event_id);
}


// Team Managers manage only the team they're assigned to (req.user.managed_team_id from team_users)
function assertCanManageTeam(user, teamId) {

	if (isAdmin(user)) return;

	if (!hasRole(user, 'Team Manager')) {
		throw new RuleError(403, "Only Team Managers and Admins can manage teams");
	}

	if (user.managed_team_id !== teamId) {
		throw new RuleError(403, "You can only manage your own team");
	}
}


// Team Managers can edit a member's details only while that member is on their roster
async function assertCanEditMember(db, user, memberId) {

	if (isAdmin(user)) return;

	if (!hasRole(user, 'Team Manager')) {
		throw new RuleError(403, "Only Team Managers and Admins can edit members");
	}

	const result = await db.query(
		`SELECT team_id FROM team_members WHERE member_id = $1 AND end_date IS NULL`,
		[memberId]
	);

	if (!user.managed_team_id || result.rows[0]?.team_id !== user.managed_team_id) {
		throw new RuleError(403, "You can only edit members on your own team");
	}
}


module.exports = {
	RuleError,
	handleRuleError,
	handleInUseError,
	assertCanDeactivateTeam,
	parseMatchTeamIds,
	assertSessionEditable,
	assertTeamsCanPlay,
	assertWithinEvent,
	assertEventFitsMatches,
	assertEventCanComplete,
	assertHasResults,
	setMatchTeams,
	assertCanRegister,
	assertCanUnregister,
	assertCanJoinTeam,
	assertCanSetRoles,
	assertCanAssignTeam,
	endTeamAssignment,
	assertCanManageEvent,
	assertCanManageMatch,
	assertCanManageTeam,
	assertCanEditMember,
};
