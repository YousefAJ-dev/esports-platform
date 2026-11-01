const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

const { getMissingFields } = require('../utils/validation');
const { handleInUseError } = require('../utils/businessRules');


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
			-- Current team comes from the open membership (at most one, enforced by uq_active_team_member)
			SELECT m.member_id, m.real_name, m.display_name, m.is_active, t.team_id, t.team_name
			FROM members m
			LEFT JOIN team_members tm
				ON m.member_id = tm.member_id
				AND tm.end_date IS NULL
			LEFT JOIN teams t
				ON tm.team_id = t.team_id
			ORDER BY m.member_id
			`
		);

		return res.status(200).json(result.rows);

	} catch (error) {

		console.error("Error Creating Member:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});


// api/members/available -- active members not currently on a team (who can be added to a roster)
// Declared before /:id so "available" isn't read as an ID
router.get("/available", async (_, res) => {

	try {

		const result = await pool.query(
			`
			SELECT m.member_id, m.real_name, m.display_name, m.is_active
			FROM members m
			WHERE m.is_active
				AND NOT EXISTS (
					SELECT 1
					FROM team_members tm
					WHERE tm.member_id = m.member_id
						AND tm.end_date IS NULL
				)
			ORDER BY m.display_name
			`
		);

		return res.status(200).json(result.rows);

	} catch (error) {

		console.error("Error getting available members:", error.message);

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
			t.team_id,
			t.team_name,
			
			EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.date_of_birth))::INT AS age,
			
			tm.team_position,
			m.is_active,
			
			COUNT(DISTINCT s.session_id) FILTER 
				(WHERE s.status = 'Completed')::INT
				AS matches_played_with_current_team,
			
			COUNT(DISTINCT e.event_id) FILTER 
				(WHERE e.status = 'Completed')::INT
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
			GROUP BY m.real_name, m.display_name, t.team_id, t.team_name,
					m.date_of_birth, tm.team_position, m.is_active, 
					tm.team_member_id
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

		// Deactivating also takes the member off their team, so both changes go in one transaction
		const client = await pool.connect();

		try {

			await client.query('BEGIN');

			const result = await client.query(query, values);

			if (result.rows.length === 0) {
				await client.query('ROLLBACK');
				return res.status(404).json({ error: "Member not Found" });
			}

			// Inactive members can't be on a roster; ending the membership keeps the history
			if (req.body.is_active === false) {
				await client.query(
					`
					UPDATE team_members
					SET end_date = GREATEST(start_date, CURRENT_DATE)
					WHERE member_id = $1
						AND end_date IS NULL
					`,
					[id]
				);
			}

			await client.query('COMMIT');

			return res.status(200).json(result.rows[0]);

		} catch (error) {
			await client.query('ROLLBACK');
			throw error;
		} finally {
			client.release();
		}

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

		return res.status(200).json({
			message: "Member deleted successfully",
			member: result.rows[0]
		});

	} catch (error) {

		if (handleInUseError(error, res, "member")) return;

		console.error("Error getting Member:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	}

});

module.exports = router;
