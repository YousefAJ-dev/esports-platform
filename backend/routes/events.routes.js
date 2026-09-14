const express = require('express');
const router = express.Router();
const pool = require('../db/pool'); // importing data base
const { getMissingFields } = require('../utils/validation');


// POST /api/events
// This route creates a new event in the database
router.post('/', async (req, res) => {
	try {

		const {
			event_name,
			description,
			location,
			start_on,
			end_on,
			timezone,
			status
		} = req.body;

		const requiredFields = [
			'event_name',
			'location',
			'start_on',
			'end_on'
		];

		const missingFields = getMissingFields(requiredFields, req.body)

		if (missingFields.length > 0) {
			return res.status(400).json({
				error: "Missing Required Fields",
				missingFields: missingFields
			});
		}

		const eventTimeZone = timezone ?? 'America/Chicago';
		const eventStatus = status ?? 'Upcoming';

		if (end_on <= start_on) {
			return res.status(400).json({
				error: "End Date & Time cannot be before Start Date & Time"
			});
		}

		const result = await pool.query(
			`
			INSERT INTO events 
				(event_name, description, location, start_on, end_on, timezone, status)
			VALUES (
				$1, 
				$2, 
				$3, 
				$4::timestamp AT TIME ZONE $6, 
				$5::timestamp AT TIME ZONE $6, 
				$6, 
				$7
			)
			RETURNING event_id, event_name, start_on, end_on
			`
			, [event_name, description, location, start_on, end_on, timezone, status]
		);

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
			SELECT event_id, event_name, description, location, start_on, end_on, timezone, status
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


// GET /api/events/id/schedule
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
			`, [id]
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
				COUNT(DISTINCT s.session_id)::INT AS session_count,
				COUNT(DISTINCT st.team_id)::INT AS team_count,
				
				COUNT(DISTINCT s.session_id) FILTER 
					( WHERE s.status = 'Completed' )::INT
					AS completed_session_count,
				
				COUNT(DISTINCT s.session_id) FILTER
					( WHERE s.status = 'In-Progress' )::INT 
					AS ongoing_session_count,

				COUNT(DISTINCT s.session_id) FILTER 
					( WHERE s.status = 'Upcoming' )::INT 
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
			, [id]
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

		// special index to make sure timezone index is 1
		let timeZoneIndex = null;

		// Whitelist of fields that are allowed to be updated
		// Prevents users from modifying protected columns (like event_id, created_at)
		const allowedFields = [
			'event_name',
			'description',
			'location',
			'start_on',
			'end_on',
			'timezone',
			'status'
		];

		const eventTimeZone = req.body.timezone;

		// ***SAFETY CHECK*** to ensure timezone is present when updating date/time
		if ((req.body.start_on !== undefined || req.body.start_on !== undefined)
			&& (!eventTimeZone)) {

			return res.status(400).json({
				error: "Must select a timezone when changing start/end time"
			});
		}

		// Ensure if there is a timezone it is the first value
		if (eventTimeZone) {
			values.push(eventTimeZone);
			timeZoneIndex = index;
			index++;
		}


		// Loop through keys sent in request body
		// Example req.body:
		// { "location": "Seoul", "status": "In-Progress" }
		Object.keys(req.body).forEach(field => {

			if (!allowedFields.includes(field)) {
				return;
			}

			// Add timezone
			if (field === "timezone") {
				fields.push(`${field} = $${timeZoneIndex}`);
				return;
			}

			// Covert datetime to TIMESTAMPTZ before query
			if (field === "start_on" || field === "end_on") {
				fields.push(`${field} = $${index}::timestamp AT TIME ZONE $${timeZoneIndex}`);
				values.push(req.body[field]);
				index++;
				return;
			}

			// Build dynamic SQL piece
			// Example: "location = $1"
			fields.push(`${field} = $${index}`);

			// Push actual value for that field
			values.push(req.body[field]);

			// Move to next parameter index
			index++;

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