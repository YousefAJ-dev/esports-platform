// Matches with their teams and results in one grouped query, shared by
// GET /sessions and GET /events/:id/matches. The where/order clauses are fixed
// strings from the routes (values go through $ params), never user input.
function matchListQuery(whereClause, orderBy) {

	return `
		SELECT
			s.session_id,
			s.event_id,
			e.event_name,
			s.session_type,
			s.scheduled_start,
			s.scheduled_end,
			s.timezone,
			s.status,

			-- Teams are folded into a JSON array so one query returns everything
			COALESCE(
				json_agg(
					json_build_object(
						'team_id', t.team_id,
						'team_name', t.team_name,
						'score', md.score,
						'is_winner', COALESCE(md.is_winner, FALSE)
					)
					ORDER BY st.session_team_id
				) FILTER (WHERE t.team_id IS NOT NULL),
				'[]'
			) AS teams

		FROM sessions s

		JOIN events e
			ON s.event_id = e.event_id

		LEFT JOIN session_teams st
			ON s.session_id = st.session_id

		LEFT JOIN teams t
			ON st.team_id = t.team_id

		LEFT JOIN match_details md
			ON st.session_id = md.session_id
			AND st.team_id = md.team_id

		${whereClause}
		GROUP BY s.session_id, e.event_name
		ORDER BY ${orderBy}
	`;
}

module.exports = {
	matchListQuery
};
