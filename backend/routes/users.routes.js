const express = require("express");
const router = express.Router();
const pool = require('../db/pool');
const { getMissingFields } = require('../utils/validation');


router.post('/', async (req, res) => {

	try {

		const requiredFields = [
			'first_name',
			'last_name',
			'username',
			'email',
			'password_hash',
			'is_active'
		];

		const { first_name, last_name, username, email, password_hash, is_active } = req.body;

		const missingFields = getMissingFields(requiredFields, req.body);

		if (missingFields.length > 0) {
			return res.status(400).json({
				error: "Missing Fields",
				missingFields: missingFields
			});
		}

		const result = await pool.query(
			`
			INSERT INTO ( first_name, last_name, username, email, password_hash, is_active)
			VALUES ($1,$2,$3,$4,$5)
			RETURNING first_name, last_name, username, email, is_active
			`,
			[first_name, last_name, username, email, password_hash, is_active]
		);

		return res.status(201).json(result.rows[0]);

	} catch (error) {

		console.error("Error posting user: ", error.message);

		return res.status(500).json({
			error: "Internal Server Error"
		});

	}

});


router.get('/', async (_, res) => {

	try {

		const result = await pool.query(
			`
			SELECT user_id, first_name, last_name, username, email, is_active
			FROM users
			ORDER BY user_id
			`
		);

		return res.status(200).json(result.rows);

	} catch (error) {

		console.error("Error getting user: ", error.message);

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
				error: `Invalid UserID: ${id} `
			});
		}

		const result = await pool.query(
			`
			SELECT user_id, first_name, last_name, username, email, is_active
			FROM users
			WHERE user_id = $1
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

		console.error("Error getting user: ", error.message);

		return res.status(500).json({
			error: "Internal Server Error"
		});

	}

});


router.get('/:id/overview', async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				error: `Invalid UserID: ${id} `
			});
		}

		const result = await pool.query(
			`
			SELECT 
			u.first_name,
			u.last_name, 
			u.username, 
			r.role_name,
			u.email,
			t.team_name AS manager_of,
			u.is_active
			FROM users u
			LEFT JOIN user_roles ur
			ON u.user_id = ur.user_id
			LEFT JOIN roles r
			ON ur.role_id = r.role_id
			LEFT JOIN team_users tu
			ON u.user_id = tu.user_id
				AND tu.end_date IS NULL
			LEFT JOIN teams t
			ON tu.team_id = t.team_id
			WHERE u.user_id = $1
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

		console.error("Error getting user: ", error.message);

		return res.status(500).json({
			error: "Internal Server Error"
		});

	}

});


router.patch('/:id', async (req, res) => {

	try {

		const allowedFields = [
			'first_name',
			'last_name',
			'username',
			'email',
			'is_active'
		];

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				error: `Invalid UserID: ${id} `
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
		UPDATE users
		SET ${fields.join(', ')}
		WHERE user_id = $${index}
		RETURNING user_id, first_name, last_name, username, email, is_active
		`;

		const result = await pool.query(query, values);

		if (result.rows.length === 0) {
			return res.status(404).json({
				error: `UserID Not Found: ${id}`
			});
		}

		return res.status(200).json(result.rows[0]);

	} catch (error) {

		console.error("Error updating user: ", error.message);

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
				error: `Invalid UserID: ${id} `
			});
		}

		const result = await pool.query(
			`
			DELETE FROM users
			WHERE user_id = $1
			RETURNING user_id, username, is_active
			`,
			[id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				error: `UserID Not Found: ${id}`
			});
		}

		return res.status(200).json(result.rows[0]);

	} catch (error) {

		console.error("Error deleting user: ", error.message);

		return res.status(500).json({
			error: "Internal Server Error"
		});

	}

});


module.exports = router;