export type SessionSummary = {
	session_id: number,
	event_id: number,
	scheduled_start: string,
	scheduled_end: string,
	actual_start?: string,
	actual_end?: string,
	timezone: string,
	session_type: string,
	status: string
};

export type UpdateSessionPayload = Partial<SessionSummary>;

export type CreateSessionPayload = {
	event_id: number | null,
	scheduled_start: string,
	scheduled_end: string,
	actual_start?: string,
	actual_end?: string,
	timezone: string,
	session_type: string,
	status: string,
};

export type SessionOverview = {
	event_name: string,
	team_1: number,
	manager_1: number,
	player_count_1: number,
	team_2: number,
	manager_2: number,
	player_count_2: number,
};

export type SessionCardProp = {
	session: SessionSummary;
};

// A team as it appears inside a match, with its result if one was recorded
export type MatchTeam = {
	team_id: number,
	team_name: string,
	score: number | null,
	is_winner: boolean
};

// One match from GET /events/:id/matches
export type EventMatch = {
	session_id: number,
	event_id: number,
	session_type: string,
	scheduled_start: string,
	scheduled_end: string,
	status: string,
	teams: MatchTeam[]
};

// A team row from GET /sessions/:id/teams
export type SessionTeam = MatchTeam & {
	manager_name: string | null,
	player_count: number
};

export type MatchResult = {
	team_id: number,
	score: number | null,
	is_winner: boolean
};

export type MatchResultPayload = {
	results: MatchResult[]
};
