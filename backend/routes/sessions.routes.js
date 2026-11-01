const express = require('express');
const router = express.Router();
const { getMissingFields } = require('../utils/validation');
const pool = require('../db/pool');
const { handleDbError } = require('../utils/dbErrors');
const { matchListQuery } = require('../utils/matchQueries');
const { canManageEvent, canManageMatch } = require('../middleware/permissions');
const { RuleError, handleRuleError, parseMatchTeamIds, assertSessionEditable, assertTeamsCanPlay, assertWithinEvent, assertHasResults, setMatchTeams } = require('../utils/businessRules');


// POST sessions
// Only whoever manages the chosen event can add matches to it
router.post('/', canManageEvent(req => req.body.event_id), async (req, res) => {

	try {

		const requiredFields = [
			'event_id',			// Foreign key
			'session_type',
			'scheduled_start',
			'scheduled_end',
			'timezone',
		];


		// VALIDATON:
		// 1. Check if missing 
		const missingFields = getMissingFields(requiredFields, req.body);

		if (missingFields.length > 0) {
			return res.status(400).json({
				error: "Missing Required Fields",
				missing: missingFields
			});
		}

		const { event_id, session_type, scheduled_start, scheduled_end, actual_start, actual_end, timezone, status, team_ids } = req.body;

		// A session must be played by exactly two teams
		const teamIds = parseMatchTeamIds(team_ids);

		// A new match has no results yet, so it can't start out completed
		if (status === 'Completed') {
			throw new RuleError(400, "Create the match first, then enter results before marking it Completed");
		}

		// eventID FK check
		const eventCheck = await pool.query(
			`
			SELECT event_id 
			FROM events 
			WHERE event_id = $1
			`,
			[event_id]
		);

		if (eventCheck.rows.length === 0) {
			return res.status(400).json({
				error: 'Invalid event_id (event does not exist)'
			});
		}

		const s_start = new Date(scheduled_start);
		const s_end = new Date(scheduled_end);
		const a_start = new Date(actual_start);
		const a_end = new Date(actual_end);

		if (s_end <= s_start) {
			return res.status(400).json({
				error: `Scheduled end time must be after scheduled start time`
			});
		}

		if ((actual_start && actual_end) && (a_end <= a_start)) {
			return res.status(400).json({
				error: `Actual end time must be after actual start time`
			});
		}


		// The session and its teams are saved together, so a match never exists without its teams
		const client = await pool.connect();

		try {

			await client.query('BEGIN');

			const result = await client.query(
				`
				INSERT INTO sessions ( 
				event_id, 
				session_type, 
				scheduled_start, 
				scheduled_end, 
				actual_start, 
				actual_end, 
				timezone, 
				status
				)
				VALUES (
				$1,
				$2,
				$3::timestamp AT TIME ZONE $7,
				$4::timestamp AT TIME ZONE $7,
				$5::timestamp AT TIME ZONE $7,
				$6::timestamp AT TIME ZONE $7,
				$7,
				$8
				)
				RETURNING session_id, event_id, session_type, scheduled_start, scheduled_end, timezone, status;
				`
				// The create form sends "" for blank actual times, which Postgres can't cast
				, [event_id, session_type, scheduled_start, scheduled_end,
					actual_start || null, actual_end || null,
					timezone, status ?? "Upcoming"]
			);

			const session = result.rows[0];

			// Checked after the insert so the overlap check can use the stored (timezone-converted) times
			await assertWithinEvent(client, session.session_id);
			await assertTeamsCanPlay(client, session.session_id, teamIds);
			await setMatchTeams(client, session.session_id, teamIds);

			await client.query('COMMIT');

			return res.status(201).json({ ...session, team_ids: teamIds });

		} catch (error) {
			await client.query('ROLLBACK');
			throw error;
		} finally {
			client.release();
		}

	} catch (error) {

		if (handleRuleError(error, res)) return;

		console.error('Error creating session: ', error.message);

		return res.status(500).json({
			error: "Internal Server Error"
		})

	}

});


// GET sessions
router.get('/', async (_, res) => {

	try {

		// Each match comes with its event name and teams so the list can show them without extra requests
		const result = await pool.query(matchListQuery('', 's.scheduled_start, s.session_id'));

		return res.json(result.rows);

	} catch (error) {

		console.error('Error getting sessions: ', error.message);

		return res.status(500).json({ error: 'Internal Server Error' });
	}

});


// GET sessions by id
router.get('/:id', async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				error: `Enter a valid ID: ${id}`
			});
		}

		const result = await pool.query(
			`
			-- event_created_by lets the UI know who may edit this match
			SELECT session_id, event_id, session_type, scheduled_start, scheduled_end, actual_start, actual_end, session_type, timezone, status,
				(SELECT e.created_by FROM events e WHERE e.event_id = sessions.event_id) AS event_created_by
			FROM sessions
			WHERE session_id = $1
			`, [id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				error: `Session Not Found: ${id}`
			})
		}

		return res.json(result.rows[0]);

	} catch (error) {

		console.error('Error getting session: ', error.message);

		return res.status(500).json({ error: 'Internal Server Error' });
	}

});


// Get Teams of a Session
router.get('/:id/teams', async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				error: `Error invalid ID: ${id}`
			});
		}

		const result = await pool.query(
			`
			-- Player counts come from a pre-aggregated subquery so the
			-- manager join can't multiply rows
			SELECT
				st.team_id,
				t.team_name,
				CONCAT_WS(' ', u.first_name, u.last_name) AS manager_name,
				COALESCE(pc.player_count, 0)::INT AS player_count,
				md.score,
				COALESCE(md.is_winner, FALSE) AS is_winner

			FROM session_teams st

			JOIN teams t
				ON st.team_id = t.team_id

			LEFT JOIN team_users tu
				ON t.team_id = tu.team_id
				AND tu.end_date IS NULL

			LEFT JOIN users u
				ON tu.user_id = u.user_id

			LEFT JOIN (
				SELECT team_id, COUNT(*) AS player_count
				FROM team_members
				WHERE end_date IS NULL
				GROUP BY team_id
			) pc
				ON t.team_id = pc.team_id

			LEFT JOIN match_details md
				ON st.session_id = md.session_id
				AND st.team_id = md.team_id

			WHERE st.session_id = $1
			ORDER BY st.session_team_id
			`, [id]
		);

		// A match with no teams yet is valid, so an empty list is returned instead of a 404

		return res.status(200).json(result.rows);

	} catch (error) {

		console.error("Error getting a session with team:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


// Get session overview
router.get('/:id/overview', async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				error: `Error invalid ID: ${id}`
			});
		}

		const result = await pool.query(
			`
			WITH session_team_details AS (
				SELECT 
					e.event_name,
					t.team_name,

					CONCAT_WS(' ', u.first_name, u.last_name) AS manager_name,

					COUNT(DISTINCT tm.member_id) FILTER 
						( WHERE tm.end_date IS NULL )::INT
						AS player_count,

					ROW_NUMBER() OVER ( 
						PARTITION BY s.session_id -- future proof
						ORDER BY st.session_team_id
					) AS team_number

				FROM sessions s

				LEFT JOIN events e
					ON s.event_id = e.event_id

				LEFT JOIN session_teams st
					ON s.session_id = st.session_id

				LEFT JOIN teams t
					ON st.team_id = t.team_id

				LEFT JOIN team_users tu
					ON t.team_id = tu.team_id
					AND tu.end_date IS NULL

				LEFT JOIN users u
					ON tu.user_id = u.user_id

				LEFT JOIN team_members tm
					ON t.team_id = tm.team_id
					AND tm.end_date IS NULL

				WHERE s.session_id = $1
				GROUP BY e.event_name, s.session_type, s.scheduled_start,
					s.scheduled_end, t.team_name, u.first_name, u.last_name,
					s.session_id, st.session_team_id
			)
			
			SELECT
				event_name,
				
				MAX(CASE WHEN team_number = 1 THEN team_name END) AS team_1,
				MAX(CASE WHEN team_number = 1 THEN manager_name END) AS manager_1,
				MAX(CASE WHEN team_number = 1 THEN player_count END) AS player_count_1,

				MAX(CASE WHEN team_number = 2 THEN team_name END) AS team_2,
				MAX(CASE WHEN team_number = 2 THEN manager_name END) AS manager_2,
				MAX(CASE WHEN team_number = 2 THEN player_count END) AS player_count_2

			FROM session_team_details
			GROUP BY event_name
			`, [id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				error: `Could not find Session Team with ID: ${id}`
			});
		}

		return res.status(200).json(result.rows[0]);

	} catch (error) {

		console.error("Error getting a session teams:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


// PUT api/sessions/:id/teams - replace the two teams playing a match
router.put('/:id/teams', canManageMatch(req => req.params.id), async (req, res) => {

	const id = parseInt(req.params.id);

	if (isNaN(id)) {
		return res.status(400).json({ error: `Error invalid ID: ${req.params.id}` });
	}

	const client = await pool.connect();

	try {

		const teamIds = parseMatchTeamIds(req.body.team_ids);

		await client.query('BEGIN');

		await assertSessionEditable(client, id);
		await assertTeamsCanPlay(client, id, teamIds);
		await setMatchTeams(client, id, teamIds);

		await client.query('COMMIT');

		return res.status(200).json({ session_id: id, team_ids: teamIds });

	} catch (error) {

		await client.query('ROLLBACK');

		if (handleRuleError(error, res)) return;

		console.error("Error updating session teams:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	} finally {
		client.release();
	}

});


// PUT api/sessions/:id/results - save every team's score/winner for a match in one transaction
router.put('/:id/results', canManageMatch(req => req.params.id), async (req, res) => {

	const id = parseInt(req.params.id);

	if (isNaN(id)) {
		return res.status(400).json({ error: `Error invalid ID: ${req.params.id}` });
	}

	const { results } = req.body;

	if (!Array.isArray(results) || results.length === 0) {
		return res.status(400).json({ error: "results must be a non-empty array" });
	}

	if (results.filter(r => r.is_winner).length > 1) {
		return res.status(400).json({ error: "A match can only have one winner" });
	}

	// Split into column arrays so all rows go up in a single unnest() insert
	const teamIds = results.map(r => r.team_id);
	const scores = results.map(r => (r.score === "" || r.score === undefined ? null : r.score));
	const winners = results.map(r => Boolean(r.is_winner));

	const client = await pool.connect();

	try {

		await client.query('BEGIN');

		await assertSessionEditable(client, id, "Results");

		// Clear the old winner first so moving the win to another team doesn't trip uq_match_winner
		await client.query(
			`UPDATE match_details SET is_winner = FALSE WHERE session_id = $1`,
			[id]
		);

		const result = await client.query(
			`
			INSERT INTO match_details (session_id, team_id, score, is_winner)
			SELECT $1, r.team_id, r.score, r.is_winner
			FROM unnest($2::int[], $3::int[], $4::bool[]) AS r(team_id, score, is_winner)
			ON CONFLICT (session_id, team_id)
			DO UPDATE SET score = EXCLUDED.score, is_winner = EXCLUDED.is_winner
			RETURNING match_detail_id, session_id, team_id, score, is_winner
			`,
			[id, teamIds, scores, winners]
		);

		await client.query('COMMIT');

		return res.status(200).json(result.rows);

	} catch (error) {

		await client.query('ROLLBACK');

		if (handleRuleError(error, res)) return;

		return handleDbError(error, res, "saving");

	} finally {
		client.release();
	}

});


// PATCH sessions
router.patch('/:id', canManageMatch(req => req.params.id), async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				error: `Invalid Team ID: ${id}`
			});
		}

		const allowedFields = [
			'session_type',
			'scheduled_start',
			'scheduled_end',
			'actual_start',
			'actual_end',
			'session_type',
			'timezone',
			'status'
		];

		const timeFields = ['scheduled_start', 'scheduled_end', 'actual_start', 'actual_end'];

		let values = [];
		let fields = [];

		// Times are read as wall-clock time in the submitted timezone, or the session's saved one.
		// The timezone param is only added when a time field uses it, since an unused param fails to type.
		let tzExpr = null;
		const timeZoneExpr = () => {
			if (!tzExpr) {
				values.push(req.body.timezone ?? null);
				tzExpr = `COALESCE($${values.length}::text, timezone)`;
			}
			return tzExpr;
		};

		Object.keys(req.body).forEach(field => {

			if (!allowedFields.includes(field)){
				return;
			}

			values.push(req.body[field]);
			const placeholder = `$${values.length}`;

			fields.push(timeFields.includes(field)
				? `${field} = ${placeholder}::timestamp AT TIME ZONE ${timeZoneExpr()}`
				: `${field} = ${placeholder}`);

		});


		if (fields.length === 0) {
			return res.status(400).json({
				error: "Invalid Fields Entered"
			});
		}

		values.push(id);

		const query =
			`
		UPDATE sessions
		SET ${fields.join(', ')}
		WHERE session_id = $${values.length}
		RETURNING session_id, event_id, session_type, scheduled_start, scheduled_end, actual_start, actual_end, session_type, timezone, status
		`;

		const client = await pool.connect();

		try {

			await client.query('BEGIN');

			// Lock the row so the status check and the update see the same state
			const current = await client.query(
				`SELECT status FROM sessions WHERE session_id = $1 FOR UPDATE`,
				[id]
			);

			if (current.rows.length === 0) {
				await client.query('ROLLBACK');
				return res.status(404).json({ error: `Session Not Found: ${id}` });
			}

			// Completed matches are locked; only the status can change, which is how a match is reopened
			const changesMoreThanStatus = Object.keys(req.body).some(field => allowedFields.includes(field) && field !== 'status');

			if (current.rows[0].status === 'Completed' && changesMoreThanStatus) {
				throw new RuleError(400, "Completed matches are locked. Change the status to reopen it first");
			}

			const result = await client.query(query, values);

			await assertWithinEvent(client, id);

			if (result.rows[0].status === 'Completed') {
				await assertHasResults(client, id);
			}

			await client.query('COMMIT');

			return res.status(200).json(result.rows[0]);

		} catch (error) {
			await client.query('ROLLBACK');
			throw error;
		} finally {
			client.release();
		}

	} catch (error) {

		if (handleRuleError(error, res)) return;

		// chk_session_schedule_date / chk_session_actual_date failed
		if (error.code === '23514') {
			return res.status(400).json({ error: "End time must be after start time" });
		}


		console.error('Error updating session: ', error.message);

		return res.status(500).json({
			error: "Internal Server Error"
		})

	}

});


// DELETE sessions by id
router.delete('/:id', canManageMatch(req => req.params.id), async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				error: "Enter a valid session ID"
			});
		}

		const result = await pool.query(
			`
			DELETE FROM sessions
			WHERE session_id = $1
			RETURNING session_id, session_type, status
			`, [id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				error: `Session Not Found: ${id}`
			})
		}

		return res.json(result.rows[0]);

	} catch (error) {

		console.error('Error deleting session: ', error.message);

		return res.status(500).json({ error: 'Internal Server Error' });
	}

});

module.exports = router;