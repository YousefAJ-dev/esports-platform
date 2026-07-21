const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { getMissingFields } = require('../utils/validation');


router.post('/', async (req, res) => {

	try {

		const requiredFields = [
			'session_id',
			'team_id'
		];

		const missingFields = getMissingFields(requiredFields, req.body);

		if (missingFields > 0){
			return res.status(400).json({
				error: "Missing Required Fields",
				missing: missingFields
			});
		}

		const { session_id, team_id } = req.body;

		const fk_session_check = await pool.query(
			`
			SELECT session_name
			FROM sessions
			WHERE session_id = $1
			`,
			[session_id]
		);

		if (fk_session_check.rows.length === 0) {
			return res.status(404).json({
				error: `Could not find Session ID: ${session_id}`
			});
		}

		const fk_team_check = await pool.query(
			`
			SELECT team_name
			FROM teams
			WHERE team_id = $1
			`,
			[team_id]
		);

		if (fk_team_check.rows.length === 0) {
			return res.status(404).json({
				error: `Could not find Team ID: ${team_id}`
			});
		}

		const br_check = await pool.query(
			`
			SELECT team_id
			FROM teams
			WHERE team_id = $1
			`,
			[team_id]
		);

		if (br_check.length > 0) {
			return res.status(400).json({
				error: `Team:${team_id} already apart of session:${session_id}`
			});
		}

		const team_count_result = await pool.query(
			`
			SELECT COUNT(*) AS team_count
			FROM session_teams
			WHERE session_id = $1
			`,
			[session_id]
		)

		const team_count = parseInt(team_count_result.rows[0].team_count)

		if ( team_count >= 2 ){
			return res.status(400).json({
				error: `Two teams already assigned to session`
			});
		}

		const result = await pool.query(
			`
			INSERT INTO session_teams (session_id, team_id)
			VALUES ($1, $2)
			RETURNING session_team_id, session_id, team_id
			`,
			[session_id, team_id]
		);

		return res.status(200).json(result.rows[0]);

	} catch (error) {

		console.error("Error creating a session with team:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


router.get('/', async (req, res) => {

	try {

		const result = await pool.query(
			`
			SELECT st.session_team_id, st.session_id, s.session_name, st.team_id, t.team_name
			FROM session_teams st
			JOIN sessions s
			ON st.session_id = s.session_id
			JOIN teams t
			ON st.team_id = t.team_id
			ORDER BY st.session_team_id
			`,
		);

		return res.status(200).json(result.rows);

	} catch (error) {

		console.error("Error getting the session with team:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


router.get('/:id', async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				error: `Error invalid ID: ${id}`
			});
		}

		const result = await pool.query(
			`
			SELECT st.session_team_id, st.session_id, s.session_name, st.team_id, t.team_name
			FROM session_teams st
			JOIN sessions s
			ON st.session_id = s.session_id
			JOIN teams t
			ON st.team_id = t.team_id
			WHERE st.session_team_id = $1
			`, [id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				error: `Could not find Session Team with ID: ${id}`
			});
		}

		return res.status(200).json(result.rows[0]);

	} catch (error) {

		console.error("Error getting a session with team:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


// router.patch('/:id', async (req, res) => {

// 	try {

// 		const allowedFields = [
// 			'session_id',
// 			'team_id'
// 		];

// 		const id = parseInt(req.params.id);

// 		if (isNaN(id)) {
// 			return res.status(400).json({
// 				error: `Error invalid ID: ${id}`
// 			});
// 		}

// 		const { session_id, team_id } = req.body;

// 		let fields = [];
// 		let values = [];
// 		let index = 1;

// 		Object.keys(req.body).forEach(field => {
// 			if (allowedFields.includes(field)) {
// 				fields.push(`${field} = $${index}`);
// 				values.push(req.body[field]);
// 				index++;
// 			}
// 		});

// 		if (values.length === 0) {
// 			return res.status(404).json({
// 				error: `Error finding fields entered`
// 			});
// 		}

// 		values.push(id);

// 		const result = await pool.query(
// 			`
// 			UPDATE session_teams
// 			SET ${fields.join(', ')}
// 			WHERE session_team_id = $${index}
// 			RETURNING session_team_id, session_id, team_id
// 			`,
// 			values
// 		);

// 		if (result.rows.length === 0) {
// 			return res.status(404).json({
// 				error: `Could not find session team with ID: ${id}`
// 			});
// 		}

// 		return res.status(200).json(result.rows[0])

// 	} catch (error) {

// 		console.error("Error updating session with team:", error.message);

// 		return res.status(500).json({ error: "Internal Server Error" });

// 	}

// });


router.delete('/:id', async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				error: `Error Invalid ID: ${id}`
			});
		}

		const result = await pool.query(
			`
			DELETE FROM session_teams
			WHERE session_team_id = $1
			RETURNING session_team_id, session_id, team_id
			`,
			[id]
		);

		return res.status(200).json(result.rows[0]);

	} catch (error) {

		console.error("Error Creating Member:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


module.exports = router;