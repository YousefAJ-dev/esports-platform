const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { getMissingFields } = require('../utils/validation');
const { handleRuleError, assertSessionEditable, assertTeamsCanPlay } = require('../utils/businessRules');


router.post('/', async (req, res) => {

	try {

		const requiredFields = [
			'session_id',
			'team_id'
		];

		const missingFields = getMissingFields(requiredFields, req.body);

		if (missingFields.length > 0){
			return res.status(400).json({
				error: "Missing Required Fields",
				missing: missingFields
			});
		}

		const { session_id, team_id } = req.body;

		// Session must exist and not be completed; team must exist, be active and not be double-booked
		await assertSessionEditable(pool, session_id);
		await assertTeamsCanPlay(pool, session_id, [Number(team_id)]);

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

		return res.status(201).json(result.rows[0]);

	} catch (error) {

		if (handleRuleError(error, res)) return;

		console.error("Error creating a session with team:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


router.get('/', async (req, res) => {

	try {

		const result = await pool.query(
			`
			SELECT st.session_team_id, st.session_id, s.session_type, st.team_id, t.team_name
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
			SELECT st.session_team_id, st.session_id, s.session_type, st.team_id, t.team_name
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