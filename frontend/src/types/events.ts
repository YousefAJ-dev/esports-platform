export type EventSummary = {
	event_id: number, 
	event_name: string, 
	description: string,
	location: string, 
	start_on: string, 
	end_on: string, 
	status: string
}

export type EventOverview = {
	event_id: number,
	event_name: string,
	session_count: number,
	team_count: number,
	completed_session_count: number,
	ongoing_session_count: number,
	upcoming_session_count: number,
	status: string
};

export type EventCardProp = {
	event: EventSummary;
};