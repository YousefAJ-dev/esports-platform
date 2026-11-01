// Shared business rule checks for match teams and team rosters (see docs/BusinessRules.md).
// Each check throws a RuleError, which routes turn into a 4xx response with handleRuleError.

const TEAMS_PER_MATCH = 2;
const TEAM_POSITIONS = ['Player', 'Captain', 'Substitute'];
const UNIQUE_VIOLATION = '23505';

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

	if (error.code === UNIQUE_VIOLATION && error.constraint === 'uq_event_team') {
		return res.status(409).json({ error: "Team is already registered for this event" });
	}

	return null;
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
			(SELECT COALESCE(is_active, TRUE) FROM teams WHERE team_id = $2) AS team_active
		`,
		[eventId, teamId]
	);

	const { event_status, team_active } = result.rows[0];

	if (event_status === null) throw new RuleError(404, `Could not find Event ID: ${eventId}`);
	if (team_active === null) throw new RuleError(404, `Could not find Team ID: ${teamId}`);
	if (event_status === 'Completed' || event_status === 'Cancelled') {
		throw new RuleError(400, `Teams cannot register for a ${event_status.toLowerCase()} event`);
	}
	if (!team_active) throw new RuleError(400, "Inactive teams cannot register for an event");
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


// A member can join a team only if both are active, the member isn't on a team already,
// and the team doesn't already have a captain when joining as one. Checked in one query.
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
			EXISTS (
				SELECT 1
				FROM team_members
				WHERE team_id = $1
					AND team_position = 'Captain'
					AND end_date IS NULL
			) AS has_captain
		`,
		[teamId, memberId]
	);

	const { team_active, member_active, current_team, has_captain } = result.rows[0];

	if (team_active === null) throw new RuleError(404, `Could not find Team ID: ${teamId}`);
	if (member_active === null) throw new RuleError(404, `Could not find Member ID: ${memberId}`);
	if (!team_active) throw new RuleError(400, "Players cannot be added to an inactive team");
	if (!member_active) throw new RuleError(400, "Inactive members cannot be added to a team");
	if (current_team) throw new RuleError(409, `Member is already on ${current_team}`);
	if (teamPosition === 'Captain' && has_captain) throw new RuleError(409, "This team already has a captain");
}


module.exports = {
	RuleError,
	handleRuleError,
	parseMatchTeamIds,
	assertSessionEditable,
	assertTeamsCanPlay,
	assertWithinEvent,
	assertEventFitsMatches,
	assertHasResults,
	setMatchTeams,
	assertCanRegister,
	assertCanUnregister,
	assertCanJoinTeam,
};
