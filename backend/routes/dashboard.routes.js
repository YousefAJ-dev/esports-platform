const express = require('express');
const router = express.Router();
const pool = require('../db/pool');


router.get('/', async (_, res) => {
	
	try {
		
		const result = await pool.query(
			`
			SELECT
			COUNT(DISTINCT e.event_id) AS total_events,

			COUNT(DISTINCT e.event_id) 
				FILTER (WHERE e.status = 'Upcoming')
				AS total_upcoming_events,

			COUNT(DISTINCT t.team_id) AS total_teams,

			COUNT(DISTINCT m.member_id) AS total_members,

			COUNT(DISTINCT m.member_id)
				FILTER (WHERE m.is_active)
				AS total_active_members,

			COUNT(DISTINCT s.session_id) AS total_sessions,

			COUNT(DISTINCT s.session_id)
				FILTER (WHERE s.status = 'Upcoming')
				AS total_upcoming_sessions,

			COUNT(DISTINCT s.session_id)
				FILTER (WHERE s.status = 'Completed')
				AS total_completed_sessions,

			COUNT(DISTINCT tu.user_id)
				FILTER (WHERE tu.end_date IS NULL)
				AS total_active_managers

			FROM sessions s
			LEFT JOIN events e
				ON s.event_id = e.event_id

			LEFT JOIN session_teams st
				ON s.session_id = st.session_id
			
			LEFT JOIN teams t
				ON st.team_id = t.team_id

			LEFT JOIN team_members tm
				ON t.team_id = tm.team_id
			
			LEFT JOIN members m
				ON tm.member_id = m.member_id

			LEFT JOIN team_users tu
				ON t.team_id = tu.team_id
			`
		);

		return res.status(200).json(result.rows);

	} catch (error) {
		
		console.error(`Error getting dashboard: `, error.message);
		
		return res.status(500).json({
			error: `Internal Server Error`
		});

	}

});

module.exports = router;
