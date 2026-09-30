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