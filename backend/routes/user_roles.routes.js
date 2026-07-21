const express = require("express");
const router = express.Router();
const pool = require('../db/pool');
const { getMissingFields } = require('../utils/validation');


router.post('/', async (req, res) => {

	try {

		const requiredFields = [
			'user_id',
			'role_id'
		];

		const { user_id, role_id } = req.body;

		const missingFields = getMissingFields(requiredFields, req.body);

		if (missingFields.length > 0) {
			return res.status(400).json({
				error: "Missing Fields",
				missingFields: missingFields
			});
		}

		const result = await pool.query(
			`
			INSERT INTO ( user_id, role_id )
			VALUES ($1,$2)
			RETURNING user_role_id, user_id, role_id
			`,
			[user_id, role_id]
		);

		return res.status(201).json(result.rows[0]);

	} catch (error) {

		console.error("Error posting user role: ", error.message);

		return res.status(500).json({
			error: "Internal Server Error"
		});

	}

});


router.get('/', async (_, res) => {

	try {

		const result = await pool.query(
			`
			SELECT user_role_id, user_id, role_id
			FROM user_roles
			ORDER BY user_role_id
			`
		);

		return res.status(200).json(result.rows);

	} catch (error) {

		console.error("Error getting user role: ", error.message);

		return res.status(500).json({
			error: "Internal Server Error"
		});

	}

});


router.get('/:id', async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				error: `Invalid ID: ${id} `
			});
		}

		const result = await pool.query(
			`
			SELECT user_role_id, user_id, role_id
			FROM user_roles
			WHERE user_role_id = $1
			`,
			[id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				error: "No ID found"
			});
		}

		return res.status(200).json(result.rows[0]);

	} catch (error) {

		console.error("Error getting user role: ", error.message);

		return res.status(500).json({
			error: "Internal Server Error"
		});

	}

});


router.patch('/:id', async (req, res) => {

	try {

		const allowedFields = [
			'user_id',
			'role_id'
		];

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				error: `Invalid ID: ${id} `
			});
		}

		let values = [];
		let fields = [];
		let index = 1;

		Object.keys(req.body).forEach(field => {
			if (allowedFields.includes(field)) {
				fields.push(`${field} = $${index}`);
				values.push(req.body[field]);
				index++;
			}
		})

		values.push(id);

		if (fields.length === 0) {
			return res.status(400).json({
				error: "no valid fields entered"
			});
		}

		const query =
			`
		UPDATE user_roles
		SET ${fields.join(', ')}
		WHERE user_role_id = $${index}
		RETURNING user_role_id, user_id, role_id
		`;

		const result = await pool.query(query, values);

		if (result.rows.length === 0) {
			return res.status(404).json({
				error: `ID Not Found: ${id}`
			});
		}

		return res.status(200).json(result.rows[0]);

	} catch (error) {

		console.error("Error updating user role: ", error.message);

		return res.status(500).json({
			error: "Internal Server Error"
		});

	}

});


router.delete('/:id', async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				error: `Invalid ID: ${id} `
			});
		}

		const result = await pool.query(
			`
			DELETE FROM user_roles
			WHERE user_role_id = $1
			RETURNING user_role_id, user_id, role_id
			`,
			[id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				error: `ID Not Found: ${id}`
			});
		}

		return res.status(200).json(result.rows[0]);

	} catch (error) {

		console.error("Error deleting user role: ", error.message);

		return res.status(500).json({
			error: "Internal Server Error"
		});

	}

});


module.exports = router;