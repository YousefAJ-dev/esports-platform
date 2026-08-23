import { apiRequest } from "./apiClient";
import type { EventOverview, EventSummary } from "../types/events";

export function getEvents():Promise<EventSummary[]> {
	return apiRequest<EventSummary[]>('/events');
}

export function getEventByID(id:string | undefined):Promise<EventSummary> {
	return apiRequest<EventSummary>(`/events/${id}`);
}

export function getEventOverview(id:string | undefined):Promise<EventOverview> {
	return apiRequest<EventOverview>(`/events/${id}/overview`);
}