export type SessionSummary = {
	session_id: number,
	event_id: number,
	scheduled_start: string,
	scheduled_end: string,
	session_type: string,
	status: string
};

export type SessionOverviewType = {
	event_id: number,
	event_name: string,
	session_count: number,
	team_count: number,
	completed_session_count: number,
	ongoing_session_count: number,
	upcoming_session_count: number,
	status: string
};

export type SessionCardProp = {
	session: SessionSummary;
};