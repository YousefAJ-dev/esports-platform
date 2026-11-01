export type TeamSummary = {
	team_id: number,
	team_name: string,
	contact_email: string,
	created_on?: string,
	is_active: boolean
};

export type TeamOverview = {
	team_name: string,
	contact_email: string,
	is_active: boolean,
	user_realname: string | null,
	active_player_count: number,
	team_captain_rname: string | null,
	team_captain_dname: string | null,
	total_matches: number,
	matches_played: number,
	matches_in_progress: number,
	upcoming_matches: number,
	total_events_participated: number
};

export type TeamRosterEntry = {
	team_name: string,
	member_id: number,
	real_name: string,
	display_name: string,
	team_position: string,
	start_date: string
};

// Body for POST /teams/:id/members; start_date defaults to today on the server
export type AddTeamMemberPayload = {
	member_id: number,
	team_position: string,
	start_date?: string
};

export type UpdateTeamPayload = Partial<Omit<TeamSummary, "team_id" | "created_on">>;
export type CreateTeamPayload = Omit<TeamSummary, "team_id" | "created_on">;

export type TeamCardProp = {
	team: TeamSummary
};
