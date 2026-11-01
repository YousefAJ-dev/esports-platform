import { apiRequest } from "./apiClient";
import type { CreateEventPayload, EventOverview, EventTeam, EventSummary, UpdateEventPayload } from "../types/events";
import type { EventMatch } from "../types/sessions";


/* Typescript Template
function functionName(parameter: ParameterType): ReturnType {
	...
}
*/


export function getEvents():Promise<EventSummary[]> {
	return apiRequest<EventSummary[]>('/events');
}

export function getEventByID(id:string | undefined):Promise<EventSummary> {
	return apiRequest<EventSummary>(`/events/${id}`);
}

export function getEventOverview(id:string | undefined):Promise<EventOverview> {
	return apiRequest<EventOverview>(`/events/${id}/overview`);
}


export function updateEventByID(id:string | undefined, updatedEvent: UpdateEventPayload):Promise<EventSummary> {
	return apiRequest<EventSummary>(`/events/${id}`,{
		method: "PATCH", // tells fetch to Patch
		body: JSON.stringify(updatedEvent), // turns Javascript to JSON
	});
}

export function createEvent(eventData: CreateEventPayload):Promise<EventSummary> {
	return apiRequest<EventSummary>(`/events`,{
		method: "POST",
		body: JSON.stringify(eventData),
	});
}

// Teams registered for an event; only these can be put into its matches
export function getEventTeams(id: string | number | undefined): Promise<EventTeam[]> {
	return apiRequest<EventTeam[]>(`/events/${id}/teams`);
}

export function registerEventTeam(id: string | undefined, teamId: number): Promise<unknown> {
	return apiRequest<unknown>(`/events/${id}/teams`, { method: "POST", body: JSON.stringify({ team_id: teamId }) });
}

export function unregisterEventTeam(id: string | undefined, teamId: number): Promise<unknown> {
	return apiRequest<unknown>(`/events/${id}/teams/${teamId}`, { method: "DELETE" });
}

// All matches in an event with their teams and results, already sorted by round
export function getEventMatches(id: string | undefined): Promise<EventMatch[]> {
	return apiRequest<EventMatch[]>(`/events/${id}/matches`);
}
