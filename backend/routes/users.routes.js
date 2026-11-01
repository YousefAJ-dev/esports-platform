const express = require("express");
const router = express.Router();
const pool = require('../db/pool');
const { handleInUseError, handleRuleError, assertCanSetRoles, assertCanAssignTeam, endTeamAssignment } = require('../utils/businessRules');
const bcrypt = require('bcrypt');
const { getMissingFields } = require('../utils/validation');


router.post('/', async (req, res) => {

	try {

		const requiredFields = [
			'first_name',
			'last_name',
			'username',
			'email',
			'password'
		];

		const { first_name, last_name, username, email, password, is_active } = req.body;

		const missingFields = getMissingFields(requiredFields, req.body);

		if (missingFields.length > 0) {
			return res.status(400).json({
				error: "Missing Fields",
				missingFields: missingFields
			});
		}

		// Never store the plain password
		const password_hash = await bcrypt.hash(password, 10);

		const result = await pool.query(
			`
			INSERT INTO users (first_name, last_name, username, email, password_hash, is_active)
			VALUES ($1,$2,$3,$4,$5,$6)
			RETURNING user_id, first_name, last_name, username, email, is_active
			`,
			[first_name, last_name, username, email, password_hash, is_active ?? true]
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
			CONCAT_WS(' ', u.first_name, u.last_name) AS real_name,
			u.username, 
			COALESCE(array_agg(r.role_name ORDER BY r.role_id) FILTER (WHERE r.role_id IS NOT NULL), '{}') AS roles,
			COALESCE(array_agg(r.role_id ORDER BY r.role_id) FILTER (WHERE r.role_id IS NOT NULL), '{}') AS role_ids,
			u.email,
			t.team_id AS managed_team_id,
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
			-- Roles are aggregated above, so a user with several roles is still one row
			GROUP BY u.user_id, t.team_id
			`
			, [id]
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

		// Deactivating your own account would log you out with no way back in
		if (id === req.user.user_id && req.body.is_active === false) {
			return res.status(400).json({ error: "You can't deactivate your own account" });
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


// PUT api/users/:id/roles - replace a user's roles with role_ids (this router is Admin-only).
// Losing the Team Manager role also ends their team assignment, in the same transaction.
router.put('/:id/roles', async (req, res) => {

	const id = parseInt(req.params.id);

	if (isNaN(id)) {
		return res.status(400).json({ error: `Invalid UserID: ${req.params.id}` });
	}

	const roleIds = req.body.role_ids;
	const client = await pool.connect();

	try {

		await client.query('BEGIN');

		const newRoles = await assertCanSetRoles(client, req.user, id, roleIds);

		await client.query(
			`DELETE FROM user_roles WHERE user_id = $1 AND role_id <> ALL($2::int[])`,
			[id, roleIds]
		);

		await client.query(
			`
			INSERT INTO user_roles (user_id, role_id)
			SELECT $1, unnest($2::int[])
			ON CONFLICT (user_id, role_id) DO NOTHING
			`,
			[id, roleIds]
		);

		if (!newRoles.includes('Team Manager')) {
			await endTeamAssignment(client, id);
		}

		await client.query('COMMIT');

		return res.status(200).json({ user_id: id, roles: newRoles });

	} catch (error) {

		await client.query('ROLLBACK');

		if (handleRuleError(error, res)) return;

		console.error("Error updating user roles:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	} finally {
		client.release();
	}

});


// PUT api/users/:id/team - assign the team a Team Manager runs ({ team_id }), or unassign ({ team_id: null })
router.put('/:id/team', async (req, res) => {

	const id = parseInt(req.params.id);
	const teamId = req.body.team_id === null ? null : parseInt(req.body.team_id);

	if (isNaN(id) || Number.isNaN(teamId)) {
		return res.status(400).json({ error: "A valid user ID and team_id (or null) are required" });
	}

	const client = await pool.connect();

	try {

		await client.query('BEGIN');

		if (teamId !== null) {
			await assertCanAssignTeam(client, id, teamId);
		}

		const current = await client.query(
			`SELECT team_id FROM team_users WHERE user_id = $1 AND end_date IS NULL`,
			[id]
		);

		// Leaving the current team first keeps "one active team per manager" true at every step
		if (current.rows[0]?.team_id !== teamId) {

			await endTeamAssignment(client, id);

			if (teamId !== null) {
				await client.query(
					`INSERT INTO team_users (team_id, user_id, start_date) VALUES ($1, $2, CURRENT_DATE)`,
					[teamId, id]
				);
			}
		}

		await client.query('COMMIT');

		return res.status(200).json({ user_id: id, team_id: teamId });

	} catch (error) {

		await client.query('ROLLBACK');

		if (handleRuleError(error, res)) return;

		console.error("Error assigning team manager:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });

	} finally {
		client.release();
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

		if (id === req.user.user_id) {
			return res.status(400).json({ error: "You can't delete your own account" });
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

		if (handleInUseError(error, res, "user")) return;

		console.error("Error deleting user: ", error.message);

		return res.status(500).json({
			error: "Internal Server Error"
		});

	}

});


module.exports = router;