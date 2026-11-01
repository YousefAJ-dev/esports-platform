const express = require('express');
const router = express.Router();
const pool = require('../db/pool');


// GET api/standings?event_id= - win/loss table from completed matches.
// Without event_id it covers every team across all events; with it, only that event's registered teams.
router.get('/', async (req, res) => {

	try {

		const eventId = req.query.event_id === undefined ? null : parseInt(req.query.event_id);

		if (Number.isNaN(eventId)) {
			return res.status(400).json({ error: "event_id must be a number" });
		}

		const result = await pool.query(
			`
			-- One grouped pass: each team's completed matches joined to its own result (md)
			-- and its opponent's (opp). Matches have two teams, so opp is a single row.
			SELECT
				t.team_id,
				t.team_name,
				COALESCE(t.is_active, TRUE) AS is_active,
				COUNT(s.session_id)::INT AS played,
				COUNT(*) FILTER (WHERE md.is_winner)::INT AS wins,
				COUNT(*) FILTER (WHERE opp.is_winner)::INT AS losses,
				(COUNT(s.session_id) - COUNT(*) FILTER (WHERE md.is_winner) - COUNT(*) FILTER (WHERE opp.is_winner))::INT AS draws,
				COALESCE(SUM(md.score), 0)::INT AS score_for,
				COALESCE(SUM(opp.score), 0)::INT AS score_against

			FROM teams t

			LEFT JOIN session_teams st
				ON t.team_id = st.team_id

			LEFT JOIN sessions s
				ON st.session_id = s.session_id
				AND s.status = 'Completed'
				AND ($1::INT IS NULL OR s.event_id = $1)

			LEFT JOIN match_details md
				ON s.session_id = md.session_id
				AND md.team_id = t.team_id

			LEFT JOIN match_details opp
				ON s.session_id = opp.session_id
				AND opp.team_id <> t.team_id

			WHERE $1::INT IS NULL
				OR EXISTS (
					SELECT 1
					FROM event_teams et
					WHERE et.event_id = $1
						AND et.team_id = t.team_id
				)

			GROUP BY t.team_id

			-- Ranked by wins, then score difference, then fewer games played
			ORDER BY
				wins DESC,
				COALESCE(SUM(md.score), 0) - COALESCE(SUM(opp.score), 0) DESC,
				played ASC,
				t.team_name
			`,
			[eventId]
		);

		return res.status(200).json(result.rows);

	} catch (error) {

		console.error("Error getting standings:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });
	}

});


module.exports = router;
