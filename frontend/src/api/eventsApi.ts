import { apiRequest } from "./apiClient";
import type { EventOverview, EventSummary, UpdateEventPayload } from "../types/events";


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