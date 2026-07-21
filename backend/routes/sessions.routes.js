const express = require('express');
const router = express.Router();
const { getMissingFields } = require('../utils/validation');
const pool = require('../db/pool');


// POST sessions
router.post('/', async (req, res) => {

	try {

		const requiredFields = [
			'event_id',			// Foreign key
			'session_type',
			'scheduled_start',
			'scheduled_end',
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

		const { event_id, session_type, scheduled_start, scheduled_end, actual_start, actual_end, status } = req.body;

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


		const result = await pool.query(
			`
			INSERT INTO sessions ( event_id, session_type, scheduled_start, scheduled_end, 
			actual_start, actual_end, session_type, status)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
			RETURNING session_id, session_type, scheduled_start, scheduled_end, session_type, status;
			`
			, [event_id, session_type, scheduled_start, scheduled_end,
				actual_start ?? null, actual_end ?? null, session_type, status ?? "Upcoming"]
		);

		return res.status(201).json(result.rows[0]);

	} catch (error) {

		console.error('Error creating session: ', error.message);

		return res.status(500).json({
			error: "Internal Server Error"
		})

	}

});


// GET sessions
router.get('/', async (_, res) => {

	try {

		const result = await pool.query(
			`
			SELECT session_id, session_type, scheduled_start, scheduled_end, session_type, status
			FROM sessions
			ORDER BY session_id
			`
		);

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
			SELECT session_id, session_type, scheduled_start, scheduled_end, session_type, status
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
			SELECT st.session_id, s.session_type, st.team_id, t.team_name
			FROM session_teams st
			JOIN sessions s
			ON st.session_id = s.session_id
			JOIN teams t
			ON st.team_id = t.team_id
			WHERE s.session_id = $1
			`, [id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				error: `Could not find Session Team with ID: ${id}`
			});
		}

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
					s.session_type AS match_bracket,
					s.scheduled_start,
					s.scheduled_end,
					t.team_name,

					CONCAT_WS(' ', u.first_name, u.last_name) AS manager_name,

					COUNT(DISTINCT tm.member_id) FILTER 
						( WHERE tm.end_date IS NULL )
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
				match_bracket,
				scheduled_start,
				scheduled_end,
				
				MAX(CASE WHEN team_number = 1 THEN team_name END) AS team_1,
				MAX(CASE WHEN team_number = 1 THEN manager_name END) AS manager_1,
				MAX(CASE WHEN team_number = 1 THEN player_count END) AS player_count_1,

				MAX(CASE WHEN team_number = 2 THEN team_name END) AS team_2,
				MAX(CASE WHEN team_number = 2 THEN manager_name END) AS manager_2,
				MAX(CASE WHEN team_number = 2 THEN player_count END) AS player_count_2

			FROM session_team_details
			GROUP BY event_name, match_bracket, scheduled_start, scheduled_end
			`, [id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				error: `Could not find Session Team with ID: ${id}`
			});
		}

		return res.status(200).json(result.rows);

	} catch (error) {

		console.error("Error getting a session teams:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


// PATCH sessions
router.patch('/:id', async (req, res) => {

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
			'status'
		];

		let values = [];
		let fields = [];
		let index = 1;

		Object.keys(req.body).forEach(field => {
			if (allowedFields.includes(field)) {
				fields.push(`${field} = $${index}`);
				values.push(req.body[field]);
				index++;
			}
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
		WHERE session_id = $${index}
		RETURNING session_id, event_id, session_type, scheduled_start, scheduled_end, actual_start, actual_end, session_type, status
		`;

		const result = await pool.query(query, values);

		if (result.rows.length === 0) {
			return res.status(404).json({
				error: `Session Not Found: ${id}`
			})
		}

		return res.status(200).json(result.rows[0]);

	} catch (error) {

		console.error('Error updating session: ', error.message);

		return res.status(500).json({
			error: "Internal Server Error"
		})

	}

});


// DELETE sessions by id
router.delete('/:id', async (req, res) => {

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