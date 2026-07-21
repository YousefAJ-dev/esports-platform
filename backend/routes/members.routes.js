const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

const { getMissingFields } = require('../utils/validation');


// api/members/ -- post member to members
router.post("/", async (req, res) => {

	try {

		const { real_name, display_name, date_of_birth, is_active } = req.body;

		const requiredFields = [
			'real_name',
			'display_name',
			'date_of_birth'
		];

		const missingFields = getMissingFields(requiredFields, req.body);

		if (missingFields.length !== 0) {
			return res.status(400).json({
				error: "Missing Fields",
				missingFields: missingFields
			});
		}

		const result = await pool.query(
			`
			INSERT INTO members (real_name, display_name, date_of_birth, is_active)
			VALUES ($1,$2,$3,$4)
			RETURNING member_id, real_name, display_name, date_of_birth, created_on, is_active
			`
			, [real_name, display_name, date_of_birth, is_active ?? true]
		);



		return res.status(201).json(result.rows[0]);

	} catch (error) {

		console.error("Error Creating Member:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


// api/members - get ALL members
router.get("/", async (_, res) => {

	try {

		const result = await pool.query(
			`
			SELECT member_id, real_name, display_name, is_active
			FROM members
			ORDER BY member_id
			`
		);

		return res.status(200).json(result.rows);

	} catch (error) {

		console.error("Error Creating Member:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


// api/members/:id -- Get member info by ID
router.get("/:id", async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({ error: `Invalid Team ID: ${id}` })
		};

		const result = await pool.query(
			`
			SELECT 
				member_id, 
				real_name, 
				display_name, 
				date_of_birth, 
				created_on, 
				is_active
			FROM members
			WHERE member_id = $1
			`
			, [id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({error: "Member Not Found"})
		}

		return res.status(200).json(result.rows[0]);

	} catch (error) {

		console.error("Error Creating Member:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


router.get('/:id/overview', async (req, res) => {

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
			m.real_name, 
			m.display_name,
			t.team_name,
			EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.date_of_birth)) AS age,
			tm.team_position,
			m.is_active,
			COUNT(DISTINCT s.session_id) FILTER 
				(WHERE s.status = 'Completed')
				AS matches_played_with_current_team,
			COUNT(DISTINCT e.event_id) FILTER 
				(WHERE e.status = 'Completed')
				AS events_participated_with_current_team
			FROM members m
			LEFT JOIN team_members tm
			ON m.member_id = tm.member_id
				AND tm.end_date IS NULL
			LEFT JOIN teams t 
			ON tm.team_id = t.team_id
			LEFT JOIN session_teams st
			ON t.team_id = st.team_id
			LEFT JOIN sessions s
			ON st.session_id = s.session_id
			LEFT JOIN events e
			ON s.event_id = e.event_id
			WHERE m.member_id = $1
			GROUP BY m.real_name, m.display_name, t.team_name,
					m.date_of_birth, tm.team_position, m.is_active, tm.team_member_id
			ORDER BY tm.team_member_id DESC
			`
			, [id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				error: `Member ID ${id} was not found`
			});
		}

		return res.status(200).json(result.rows[0]);

	} catch (error) {

		console.error("Error assigning member to team", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


// api/members/:id -- Update member by id
router.patch("/:id", async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({ error: `Invalid Team ID: ${id}` })
		};

		const allowedFields = [
			'real_name',
			'display_name',
			'date_of_birth',
			'is_active'
		];

		let fields = []; // query fields

		let values = []; // req.body values

		let index = 1;

		Object.keys(req.body).forEach(field => {
			if (allowedFields.includes(field)) {
				fields.push(`${field} = $${index}`);
				values.push(req.body[field]);
				index++;
			}
		});

		if (fields.length === 0) {
			return res.status(404).json({
				error: "Invalid Fields Entered"
			});
		}

		values.push(id);

		const query =
			`
			UPDATE members
			SET ${fields.join(', ')}
			WHERE member_id = $${index}
			RETURNING member_id, real_name, display_name, date_of_birth, created_on, is_active
			`
			;

		const result = await pool.query(query, values);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Member not Found" });
		}

		return res.status(201).json(result.rows[0]);

	} catch (error) {

		console.error("Error getting Teams:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


router.delete("/:id", async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({ error: `Invalid Team ID: ${id}` })
		};

		const result = await pool.query(
			`
			DELETE FROM members
			WHERE member_id = $1
			RETURNING member_id, display_name
			`,
			[id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Member not found" })
		}

		return res.status(201).json({
			message: "Member deleted successfully",
			member: result.rows[0]
		});

	} catch (error) {

		console.error("Error getting Member:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});

module.exports = router;
