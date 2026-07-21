const express = require('express');
const router = express.Router();
const pool = require("../db/pool");
const { getMissingFields } = require('../utils/validation');


// POST api/teams
router.post('/', async (req, res) => {

	try {

		const requiredFields = [
			"team_name",
			"contact_email ",
		];

		// VALIDATION
		const missingFields = getMissingFields(requiredFields, req.body)

		if (missingFields.length > 0) {
			return res.status(400).json({
				error: `Missing Fields: ${missingFields}`
			});
		}

		const { team_name, contact_email, is_active } = req.body;

		const result = await pool.query(
			`
			INSERT INTO teams (team_name, contact_email, is_active)
			VALUES ($1,$2,$3)
			RETURNING team_id, team_name, created_on, contact_email, is_active
			`,
			[team_name, contact_email, is_active ?? true]
		);

		return res.status(201).json(result.rows[0]);

	} catch (error) {

		console.error("Error getting Teams:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


// GET api/teams
router.get('/', async (_, res) => {

	try {

		const result = await pool.query(
			`
			SELECT team_id, team_name, is_active
			FROM teams
			ORDER BY team_id
			`
		);

		return res.json(result.rows);

	} catch (error) {

		console.error("Error getting Teams:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


// GET api/teams/:id
router.get('/:id', async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) { return res.status(400).json({ error: `Invalid Team ID: ${id}` }) };

		const result = await pool.query(
			`
			SELECT team_id, team_name, created_on, contact_email, is_active
			FROM teams
			WHERE team_id = $1
			`,
			[id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Team not found" })
		}

		return res.json(result.rows[0]);

	} catch (error) {

		console.error("Error getting Teams:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


// GET api/teams/:id/members
router.get('/:id/members', async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				error: "Not a valid team ID"
			});
		}

		// Team members and teams FK check
		const team_check = await pool.query(
			`
			SELECT team_id, team_name
			FROM teams
			WHERE team_id = $1
			`
			, [id]
		);

		if (team_check.rows.length === 0) {
			return res.status(404).json({
				error: "No team found"
			});
		}

		const result = await pool.query(
			`
			SELECT 
			t.team_id, 
			t.team_name,
			m.member_id
			m.display_name,
			tm.team_position
			FROM team_members tm
			JOIN teams t 
			ON tm.team_id = t.team_id
			JOIN members m 
			ON tm.member_id = m.member_id
			WHERE tm.team_id = $1
			AND tm.end_date IS NULL
			`
			, [id]
		);

		return res.status(200).json(result.rows);

	} catch (error) {

		console.error("Error getting team members");

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


// GET api/teams/:id/roster
router.get('/:id/roster', async (req, res) => {
	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(404).json({
				error: `Invalid ID: ${id}`
			});
		}

		const result = await pool.query(
			`
			SELECT
				t.team_name,
				m.real_name,
				m.display_name,
				tm.team_position,
				tm.start_date
			FROM teams t

			LEFT JOIN team_members tm
				ON t.team_id = tm.team_id
				AND tm.end_date IS NULL

			LEFT JOIN members m
				ON tm.member_id = m.member_id

			WHERE t.team_id = $1
			`
			, [id]
		);

		if (result.rows[0].length === 0) {
			return res.status(404).json({
				error: `Could not find ID: ${id}`
			});
		}

		return res.status(200).json(result.rows);

	} catch (error) {

		console.log('Error getting Team', error.message);

		return res.status(500).json(
			{ error: "Internal Server Error" }
		);

	}
})


// GET api/teams/:id/overview
router.get('/:id/overview', async (req, res) => {
	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(404).json({
				error: `Invalid ID: ${id}`
			});
		}

		const result = await pool.query(
			`
			SELECT
			t.team_name,
			t.contact_email,
			t.is_active,
			CONCAT_WS(' ', u.first_name, u.last_name) AS user_realname,
			COUNT(DISTINCT m.member_id) FILTER 
				( WHERE m.is_active IS TRUE )
				AS active_player_count,
			MAX (
				CASE 
					WHEN tm.team_position = 'Captain'
					THEN m.real_name
				END
			) AS team_captain_rname,
			MAX (
				CASE
					WHEN tm.team_position = 'Captain'
					THEN m.display_name
				END
			) AS team_captain_dname,
			COUNT(DISTINCT st.session_id) AS total_matches,
			COUNT(DISTINCT st.session_id) FILTER 
				( WHERE s.status = 'Completed')
			 	AS matches_played,
			COUNT(DISTINCT st.session_id) FILTER 
				( WHERE s.status = 'In-Progress')
			 	AS matches_in_progress,
			COUNT(DISTINCT st.session_id) FILTER 
				( WHERE s.status = 'Upcoming')
			 	AS upcoming_matches,
			COUNT(DISTINCT e.event_id) AS total_events_participated
			FROM teams t
			LEFT JOIN team_members tm
			ON t.team_id = tm.team_id
				AND tm.end_date IS NULL
			LEFT JOIN members m
			ON tm.member_id = m.member_id
			LEFT JOIN team_users tu
			ON t.team_id = tu.team_id
				AND tu.end_date IS NULL
			LEFT JOIN users u
			ON tu.user_id = u.user_id
			LEFT JOIN session_teams st
			ON t.team_id = st.team_id
			LEFT JOIN sessions s
			ON st.session_id = s.session_id
			LEFT JOIN events e
			ON s.event_id = e.event_id
			WHERE t.team_id = $1
			GROUP BY t.team_id, t.team_name, t.contact_email, 
				t.is_active, u.first_name, u.last_name
			`
			, [id]
		);

		if (result.rows[0].length === 0) {
			return res.status(404).json({
				error: `Could not find ID: ${id}`
			});
		}

		return res.status(200).json(result.rows[0]);

	} catch (error) {

		console.log('Error getting Team', error.message);

		return res.status(500).json(
			{ error: "Internal Server Error" }
		);

	}
})


// PATCH api/teams/:id
router.patch('/:id', async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({ error: `Invalid Team ID: ${id}` })
		};

		const allowedFields = ['team_name', 'contact_email ', 'is_active'];

		let fields = []; // SQL field

		let values = []; // Value of Field

		let index = 1;

		Object.keys(req.body).forEach(field => {
			if (allowedFields.includes(field)) {
				fields.push(`${field} = $${index}`);
				values.push(req.body[field]);
				index++;
			}
		});

		if (fields.length === 0) {
			return res.status(400).json({ error: "Invalid Fields Entered" });
		}

		values.push(id);

		const query = `
			UPDATE teams
			SET ${fields.join(', ')}
			WHERE team_id = $${index}
			RETURNING team_id, team_name, contact_email, created_on, is_active
		`;

		const result = await pool.query(query, values);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Team not found" });
		}

		return res.json(result.rows[0]);

	} catch (error) {

		console.error("Error Patching Teams:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}
});


// DELETE api/teams/:id
router.delete('/:id', async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({ error: `Invalid Team ID: ${id}` })
		};

		const result = await pool.query(
			`
			DELETE FROM teams
			WHERE team_id = $1
			RETURNING team_id, team_name
			`
			, [id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Team not found" })
		}

		return res.status(200).json({
			message: "Team deleted successfully",
			team: result.rows[0]
		});

	} catch (error) {

		console.error("Error Deleting Team:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});

module.exports = router;