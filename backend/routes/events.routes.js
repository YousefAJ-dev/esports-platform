const express = require('express');
const router = express.Router();
const pool = require('../db/pool'); // importing data base
const { getMissingFields } = require('../utils/validation');


// POST /api/events
// This route creates a new event in the database
router.post('/', async (req, res) => {
	try {

		const requiredFields = [
			'event_name',
			'description',
			'location',
			'start_on',
			'end_on'
		]

		const missingFields = getMissingFields(requiredFields, req.body)

		if (missingFields.length > 0) {
			return res.status(400).json({
				error: "Missing Required Fields",
				missingFields: missingFields
			});
		}

		// 1. ----------------------------------------
		// Extract values from the incoming request body
		// req.body comes from JSON sent by the client
		// Example client request:
		// {
		//   "event_name": "Worlds 2026",
		//   "location": "Tokyo Dome",
		//   ...
		// }
		// ----------------------------------------
		const { event_name, description, location, start_on, end_on } = req.body;

		const start_date = new Date(start_on);
		const end_date = new Date(end_on);

		if (end_date <= start_date) {
			return res.status(400).json({
				error: "End Date & Time cannot be before Start Date & Time"
			});
		}

		// 3. ----------------------------------------
		// Run SQL query using PostgreSQL pool
		// pool.query sends the SQL command to the database
		// Values that replace $1 $2 $3 etc
		// This prevents SQL injection
		// ----------------------------------------
		const result = await pool.query(
			`
			INSERT INTO events (event_name, description, location, start_on, end_on) 
			VALUES ($1, $2, $3, $4, $5)
			RETURNING event_id, event_name, start_on, end_on, status
			`,
			[event_name, description, location, start_on, end_on]
		);

		// 5. ----------------------------------------
		// Send success response
		// result.rows[0] contains the inserted row
		// RETURNING in SQL allows us to get the new record
		// ----------------------------------------
		res.status(201).json(result.rows[0]);


	} catch (error) {

		// 6. ----------------------------------------
		// If anything fails (DB error, etc)
		// send a 500 server error response
		// ----------------------------------------
		console.error("Error posting event: ", error.message);


		return res.status(500).json({
			error: 'Internal Server Error'
		});
	}
});


// GET /api/events/
router.get('/', async (_, res) => {

	try {	// Query Database
		const result = await pool.query(`
			SELECT event_id, event_name, location, start_on, end_on, status
			FROM events
			ORDER BY start_on;	
		`);

		// Send JSON response
		res.json(result.rows);

	} catch (error) {

		// Console error
		console.error('Error fetching events:', error.message);

		// API returns JSON error
		res.status(500).json({
			error: 'Internal Server Error'
		});

	}

});


// GET /api/events/id
router.get('/:id', async (req, res) => {

	try {	// Query Database

		const id = req.params.id;

		const result = await pool.query(`
			SELECT event_id, event_name, location, start_on, end_on, status
			FROM events
			WHERE event_id = $1;
			`,
			[id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				error: 'Event not found'
			});
		};

		// Send JSON response
		res.json(result.rows[0]);

	} catch (error) {

		// Console error
		console.error('Error fetching event:', error.message);

		// API returns JSON error
		res.status(500).json({
			error: 'Internal Server Error'
		});

	}

});


// GET /api/events/:id/sessions
router.get('/:id/sessions', async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) { return res.status(400).json({ error: "Invalid event ID" }) };

		const result = await pool.query(
			`
			SELECT 
				e.event_name,
				s.session_id,
				s.scheduled_start, 
				s.session_type, 
				s.status
			FROM sessions s
			JOIN events e ON s.event_id = e.event_id
			WHERE s.event_id = $1
			ORDER BY s.scheduled_start
			`,
			[id]
		);

		return res.json(result.rows);

	} catch (error) {

		console.error("Error getting event's sessions:", error.message);

		return res.status(500).json({ error: 'Internal Server Error' });
	}

});


// GET /api/events/id/overview
router.get('/:id/schedule', async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				error: "Invalid event ID"
			});
		}


		const result = await pool.query(
			`
			SELECT
				e.event_name,
				s.session_type AS match_bracket,
				s.scheduled_start,
				s.scheduled_end,
				e.status
			
			FROM events e

			LEFT JOIN sessions s
				ON s.event_id = e.event_id

			WHERE e.event_id = $1
			`,[id]
		);

		return res.status(200).json(result.rows);

	} catch (error) {

		console.error("Error getting event's sessions:", error.message);

		return res.status(500).json({ error: 'Internal Server Error' });
	}

});


// GET /api/events/id/overview
router.get('/:id/overview', async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				error: "Invalid event ID"
			});
		}


		const result = await pool.query(
			`
			SELECT
				e.event_id,
				e.event_name,

				-- Count unique sessions belonging to this event
				-- DISTINCT prevents counting the same session multiple times
				COUNT(DISTINCT s.session_id) AS session_count,
				COUNT(DISTINCT st.team_id) AS team_count,
				
				COUNT(DISTINCT s.session_id) FILTER 
					( WHERE s.status = 'Completed' ) 
					AS completed_session_count,
				
				COUNT(DISTINCT s.session_id) FILTER
					( WHERE s.status = 'In-Progress' ) 
					AS ongoing_session_count,

				COUNT(DISTINCT s.session_id) FILTER 
					( WHERE s.status = 'Upcoming' ) 
					AS upcoming_session_count,

				e.status

			-- Start with the events table
			FROM events e

			-- Keep the event even if it has no sessions
			LEFT JOIN sessions s
				ON e.event_id = s.event_id

			-- Keep sessions even if no teams have been assigned yet
			LEFT JOIN session_teams st
				ON s.session_id = st.session_id

			-- Restrict to one event
			WHERE e.event_id = $1

			-- Since COUNT() is an aggregate, every non-aggregate column
			-- in SELECT must appear in GROUP BY
			GROUP BY
				e.event_id,
				e.status,
				e.event_name
			`
			,[id]
		);

		return res.status(200).json(result.rows[0]);

	} catch (error) {

		console.error("Error getting event's sessions:", error.message);

		return res.status(500).json({ error: 'Internal Server Error' });
	}

});



// DELETE api/events/:id
router.delete("/:id", async (req, res) => {

	try {

		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({ error: "Invalid Event ID" });
		};

		const result = await pool.query(
			`
			DELETE FROM events
			WHERE event_id = $1
			RETURNING *;
			`,
			[id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Event not found" });
		};

		return res.json({
			message: "Event deleted",
			event: result.rows[0]
		});

	} catch (error) {

		console.error('Error deleting event:', error.message);

		return res.status(500).json({
			error: "Internal Server Error"
		});
	}

});


// PATCH using id
router.patch('/:id', async (req, res) => {

	try {

		// Extract ID from URL and convert to number
		const id = parseInt(req.params.id);

		// Validate ID (must be a number)
		if (isNaN(id)) {
			return res.status(400).json({ error: "Invalid Event ID" });
		}

		// This will store SQL "SET" clauses
		// Example: ["event_name = $1", "location = $2"]
		let fields = [];

		// This will store actual values for placeholders
		// Example: ["Worlds", "Tokyo"]
		let values = [];

		// Keeps track of parameter position ($1, $2, $3...)
		let index = 1;

		// Whitelist of fields that are allowed to be updated
		// Prevents users from modifying protected columns (like event_id, created_at)
		const allowedFields = [
			'event_name',
			'description',
			'location',
			'start_on',
			'end_on',
			'status'
		];

		// Loop through keys sent in request body
		// Example req.body:
		// { "location": "Seoul", "status": "In-Progress" }
		Object.keys(req.body).forEach(field => {

			// Only allow updates for whitelisted fields
			if (allowedFields.includes(field)) {

				// Build dynamic SQL piece
				// Example: "location = $1"
				fields.push(`${field} = $${index}`);

				// Push actual value for that field
				values.push(req.body[field]);

				// Move to next parameter index
				index++;
			}
		});

		// If no valid fields were provided, reject request
		if (fields.length === 0) {
			return res.status(400).json({ error: "No fields provided for update" });
		}

		// Add ID as the final parameter for WHERE clause
		values.push(id);

		// Build final SQL query dynamically
		const query = `
			UPDATE events
			SET ${fields.join(', ')}       -- joins fields like: "a = $1, b = $2"
			WHERE event_id = $${index}     -- last parameter is ID
			RETURNING *;                  -- return updated row
    `;

		// Execute query with values array
		const result = await pool.query(query, values);

		// If no rows updated → event does not exist
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Event not found" });
		}

		// Return updated event data to client
		return res.json(result.rows[0]);

	} catch (error) {

		// Log error for debugging
		console.error('Error patching event:', error.message);

		// Return generic server error to client
		return res.status(500).json({ error: "Internal Server Error" });

	}
});


module.exports = router;