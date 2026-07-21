const express = require('express');
const router = express.Router();
exports.router = router;
const pool = require('../db/pool');
const { getMissingFields } = require('../utils/validation');


router.post('/', async (req, res) => {

	try {

		const requiredFields = [
			'member_id', 'team_id', 'start_date', 'team_position'
		];

		// VALIDATION
		const missingFields = getMissingFields(requiredFields, req.body)

		if (missingFields.length > 0) {
			return res.status(400).json({
				error: `Missing Fields: ${missingFields}`
			});
		}

		const { team_id, member_id, start_date, end_date, team_position } = req.body;

		const end = new Date(end_date);
		const start = new Date(start_date);

		if (end_date && (end < start)) {
			return res.status(400).json({
				error: "End date cannot be before start date"
			});
		}

		// Team_id FK check
		const team_id_check = await pool.query(
			`
			SELECT team_id
			FROM teams
			WHERE team_id = $1
			`,
			[team_id]
		);

		if (team_id_check.rows.length === 0) {
			return res.status(400).json({
				error: `Invalid Team ID: ${team_id}`
			});
		}

		// member_id FK check
		const member_id_check = await pool.query(
			`
			SELECT member_id
			FROM members
			WHERE member_id = $1
			`,
			[member_id]
		);

		if (member_id_check.rows.length === 0) {
			return res.status(400).json({
				error: `Invalid Member ID: ${member_id}`
			});
		}

		// Check if the member is NOT currently active on another team 
		const member_rule_check = await pool.query(
			`
			SELECT team_member_id, team_id, member_id
			FROM team_members
			WHERE member_id = $1
			AND end_date IS NULL
			`
			, [member_id]
		);

		if (member_rule_check.rows.length > 0) {
			return res.status(400).json({
				error: "Member must not already be a part of a team"
			})
		}

		const result = await pool.query(
			`
			INSERT INTO team_members ( team_id, member_id, start_date, 
				end_date, team_position)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING team_member_id, team_id, member_id, 
				start_date, end_date, team_position
			`
			, [team_id, member_id, start_date, end_date ?? null, team_position]
		);

		return res.status(201).json(result.rows[0]);

	} catch (error) {

		console.error("Error assigning member to team: ", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});

// GET Teams/
router.get('/', async (_, res) => {

	try {

		const result = await pool.query(
			`
			SELECT 
			tm.team_member_id, 
			tm.team_id, 
			t.team_name, 
			tm.member_id, 
			m.real_name,
			tm.start_date,
			m.is_active,
			tm.team_position
			FROM team_members tm
			JOIN teams t 
			ON tm.team_id = t.team_id
			JOIN members m 
			ON tm.member_id = m.member_id
			ORDER BY tm.team_member_id
			`
		);

		if (result.rows.length === 0) {
			return res.status(400).json({
				error: "No team_members found"
			});
		}

		return res.status(200).json(result.rows);

	} catch (error) {

		console.error("Error assigning member to team");

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


router.get('/:id', async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				error: `Invalid ID: ${id}`
			});
		}

		const result = await pool.query(
			`
			SELECT 
			tm.team_member_id, 
			tm.team_id, 
			t.team_name, 
			tm.member_id, 
			m.real_name,
			tm.start_date,
			m.is_active,
			tm.team_position
			FROM team_members tm
			JOIN teams t 
			ON tm.team_id = t.team_id
			JOIN members m 
			ON tm.member_id = m.member_id
			WHERE tm.team_member_id
			`
			, [id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				error: `Team members not found `
			});
		}

		return res.status(200).json(result.rows[0]);

	} catch (error) {

		console.error("Error assigning member to team");

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


router.patch('/:id', async (req, res) => {

	try {

		const allowedFields = [
			'team_id',
			'member_id',
			'start_date',
			'end_date',
			'team_position'
		];

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				error: `Please Enter a valid ID: ${id}`
			});
		}

		let fields = [];
		let values = [];
		let index = [];

		Object.keys(req.body).forEach(field => {
			if (allowedFields.includes(field)) {
				fields.push(`${field} = $${index}`);
				values.push(req.body[field]);
				index++;
			}
		});

		if (fields.length === 0) {
			return res.status(400).json({
				error: `Please Enter a Valid Fields`
			});
		}

		values.push(id);

		const query = `
		UPDATE team_members
		SET ${fields.join(', ')}
		WHERE team_member_id = $${index}
		RETURNING team_id, member_id, start_date, end_date, team_position
		`

		const result = await pool.query(query, values);

		if (result.rows.length === 0) {
			return res.status(404).json({
				error: "No team member found with that ID"
			})
		}

		return res.status(200).json(result.rows[0]);


	} catch (error) {

		console.error("Error updating team member");

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


router.delete('/:id', async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				error: `Please Enter a valid ID: ${id}`
			});
		}

		const result = await pool.query(
			`
			DELETE FROM team_members tm
			USING teams t, members m
			WHERE team_member_id = $1
			AND t.team_id = tm.team_id
			AND m.member_id = tm.member_id
			RETURNING team_member_id, team_id, team_name, member_id, real_name
			`, [id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				error: "No team member found with that ID"
			});
		}

		return res.status(200).json(result.rows[0]);

	} catch (error) {

		console.error("Error deleting member to team");

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


module.exports = router;