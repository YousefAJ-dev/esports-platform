const express = require("express");
const router = express.Router();
const pool = require('../db/pool');
const { getMissingFields } = require('../utils/validation');


router.post('/', async (req, res) => {

	try {

		const requiredFields = [
			'team_id',
			'user_id',
			'start_date'
		];

		const { team_id, user_id, start_date, end_date } = req.body;

		const missingFields = getMissingFields(requiredFields, req.body);

		if (missingFields.length > 0) {
			return res.status(400).json({
				error: "Missing Fields",
				missingFields: missingFields
			});
		}

		const fk_team_check = await pool.query(`
			SELECT team_name
			FROM teams
			WHERE team_id = $1
			`, [team_id]
		);

		if (fk_team_check.rows.length === 0) {
			return res.status(404).json({
				error: "Team ID not found"
			});
		}

		const fk_user_check = await pool.query(`
			SELECT username
			FROM users
			WHERE user_id = $1
			`, [user_id]
		);


		if (fk_user_check.rows.length === 0) {
			return res.status(404).json({
				error: "User ID not found"
			});
		}

		const team_rule = await pool.query(
			`
			SELECT team_user_id
			FROM team_users
			WHERE team_id = $1
			AND end_date IS NULL
			`
			, [team_id]
		);

		const user_rule = await pool.query(
			`
			SELECT team_user_id
			FROM team_users
			WHERE user_id = $1
			AND end_date IS NULL
			`
			, [user_id]
		);

		if (team_rule.rows.length > 0) {
			return res.status(400).json({
				error: "Team is already being managed"
			});
		}

		if (user_rule.rows.length > 0) {
			return res.status(400).json({
				error: "User is already being managed"
			});
		}

		const start = new Date(start_date);
		const end = new Date(end_date);

		if (end_date && (end <= start)) {
			return res.status(400).json({
				error: "End date cannot be on or before the start date"
			});
		}

		const result = await pool.query(
			`
			INSERT INTO team_users ( team_id, user_id, start_date, end_date )
			VALUES ($1,$2,$3,$4)
			RETURNING team_user_id, team_id, user_id, start_date, end_date
			`,
			[team_id, user_id, start_date, end_date]
		);

		return res.status(201).json(result.rows[0]);

	} catch (error) {

		console.error("Error posting team user: ", error.message);

		return res.status(500).json({
			error: "Internal Server Error"
		});

	}

});


router.get('/', async (_, res) => {

	try {

		const result = await pool.query(
			`
			SELECT team_user_id, team_id, user_id, start_date, end_date
			FROM team_users
			ORDER BY team_user_id
			`
		);

		return res.status(200).json(result.rows);

	} catch (error) {

		console.error("Error getting team users: ", error.message);

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
			SELECT team_user_id, team_id, user_id, start_date, end_date
			FROM team_users
			WHERE team_user_id = $1
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

		console.error("Error getting team users: ", error.message);

		return res.status(500).json({
			error: "Internal Server Error"
		});

	}

});


router.patch('/:id', async (req, res) => {

	try {

		const allowedFields = [
			'team_id',
			'user_id',
			'start_date',
			'end_date'
		];

		const id = parseInt(req.params.id);

		const { team_id, user_id } = req.body;

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

		const fk_team = await pool.query(
			`
			SELECT team_name
			FROM teams
			WHERE team_id = $1
			`,
			[team_id]
		);

		const fk_user = await pool.query(
			`
			SELECT username
			FROM users
			WHERE user_id = $1
			`,
			[user_id]
		);

		if ( fk_team.rows.length > 0){
			return res.status(400).json({
				error: `Team ID Does not exist`
			});
		}

		if ( fk_user.rows.length > 0){
			return res.status(400).json({
				error: `User ID Does not exist`
			});
		}

		const query =
		`
		UPDATE team_users
		SET ${fields.join(', ')}
		WHERE team_user_id = $${index}
		RETURNING team_user_id, team_id, user_id, start_date, end_date
		`;

		const result = await pool.query(query, values);

		if (result.rows.length === 0) {
			return res.status(404).json({
				error: `ID Not Found: ${id}`
			});
		}

		return res.status(200).json(result.rows[0]);

	} catch (error) {

		console.error("Error updating team user: ", error.message);

		return res.status(500).json({
			error: "Internal Server Error"
		});

	}

});


// router.delete('/:id', async (req, res) => {

// 	try {

// 		const id = parseInt(req.params.id);

// 		if (isNaN(id)) {
// 			return res.status(400).json({
// 				error: `Invalid ID: ${id} `
// 			});
// 		}

// 		const result = await pool.query(
// 			`
// 			DELETE FROM team_users
// 			WHERE team_user_id = $1
// 			RETURNING team_user_id, team_id, user_id, start_date, end_date
// 			`,
// 			[id]
// 		);

// 		if (result.rows.length === 0) {
// 			return res.status(404).json({
// 				error: `ID Not Found: ${id}`
// 			});
// 		}

// 		return res.status(200).json(result.rows[0]);

// 	} catch (error) {

// 		console.error("Error deleting team user: ", error.message);

// 		return res.status(500).json({
// 			error: "Internal Server Error"
// 		});

// 	}

// });


module.exports = router;