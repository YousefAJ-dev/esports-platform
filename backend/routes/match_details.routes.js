const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { getMissingFields } = require('../utils/validation');
const { handleDbError } = require('../utils/dbErrors');


// POST api/match_details
router.post('/', async (req, res) => {

	try {

		const requiredFields = [
			'session_id',
			'team_id'
		];

		const missingFields = getMissingFields(requiredFields, req.body);

		if (missingFields.length > 0) {
			return res.status(400).json({
				error: "Missing Fields",
				missingFields: missingFields
			});
		}

		const { session_id, team_id, score, is_winner } = req.body;

		const result = await pool.query(
			`
			INSERT INTO match_details (session_id, team_id, score, is_winner)
			VALUES ($1, $2, $3, $4)
			RETURNING match_detail_id, session_id, team_id, score, is_winner
			`,
			[session_id, team_id, score ?? null, is_winner ?? false]
		);

		return res.status(201).json(result.rows[0]);

	} catch (error) {
		return handleDbError(error, res, "creating");
	}

});


// GET api/match_details
router.get('/', async (_, res) => {

	try {

		const result = await pool.query(
			`
			SELECT md.match_detail_id, md.session_id, md.team_id, t.team_name, md.score, md.is_winner
			FROM match_details md
			JOIN teams t
			ON md.team_id = t.team_id
			ORDER BY md.session_id, md.match_detail_id
			`
		);

		return res.status(200).json(result.rows);

	} catch (error) {
		return handleDbError(error, res, "getting");
	}

});


// GET api/match_details/:id
router.get('/:id', async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({ error: `Invalid ID: ${req.params.id}` });
		}

		const result = await pool.query(
			`
			SELECT md.match_detail_id, md.session_id, md.team_id, t.team_name, md.score, md.is_winner
			FROM match_details md
			JOIN teams t
			ON md.team_id = t.team_id
			WHERE md.match_detail_id = $1
			`,
			[id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: `Could not find Match Detail ID: ${id}` });
		}

		return res.status(200).json(result.rows[0]);

	} catch (error) {
		return handleDbError(error, res, "getting");
	}

});


// PATCH api/match_details/:id - only the result fields can change
router.patch('/:id', async (req, res) => {

	try {

		const allowedFields = ['score', 'is_winner'];

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({ error: `Invalid ID: ${req.params.id}` });
		}

		let fields = [];
		let values = [];
		let index = 1;

		Object.keys(req.body).forEach(field => {
			if (allowedFields.includes(field)) {
				fields.push(`${field} = $${index}`);
				values.push(req.body[field]);
				index++;
			}
		});

		if (fields.length === 0) {
			return res.status(400).json({ error: "No valid fields entered" });
		}

		values.push(id);

		const result = await pool.query(
			`
			UPDATE match_details
			SET ${fields.join(', ')}
			WHERE match_detail_id = $${index}
			RETURNING match_detail_id, session_id, team_id, score, is_winner
			`,
			values
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: `Could not find Match Detail ID: ${id}` });
		}

		return res.status(200).json(result.rows[0]);

	} catch (error) {
		return handleDbError(error, res, "updating");
	}

});


// DELETE api/match_details/:id
router.delete('/:id', async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({ error: `Invalid ID: ${req.params.id}` });
		}

		const result = await pool.query(
			`
			DELETE FROM match_details
			WHERE match_detail_id = $1
			RETURNING match_detail_id, session_id, team_id
			`,
			[id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: `Could not find Match Detail ID: ${id}` });
		}

		return res.status(200).json(result.rows[0]);

	} catch (error) {
		return handleDbError(error, res, "deleting");
	}

});


module.exports = router;
