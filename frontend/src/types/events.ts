export type EventSummary = {
	event_id: number, 
	event_name: string, 
	description?: string | null,
	location: string, 
	start_on: string, 
	end_on: string, 
	timezone: string,
	status: string,
	// The Organizer who planned it; they (and Admins) can manage it
	created_by?: number | null
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

// A team registered for an event, from GET /events/:id/teams
export type EventTeam = {
	team_id: number,
	team_name: string,
	is_active: boolean,
	registered_on: string,
	match_count: number
};

export type UpdateEventPayload = Partial<EventSummary>;

export type CreateEventPayload = Omit<EventSummary, "event_id">;

export type EventCardProp = {
	event: EventSummary;
};