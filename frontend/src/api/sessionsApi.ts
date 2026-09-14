import type { SessionOverview, SessionSummary } from "../types/sessions";
import { apiRequest } from "./apiClient";

export function getSessions(): Promise<SessionSummary[]> {
	return apiRequest<SessionSummary[]>('/sessions');
}

export function getSessionByID(id:string | undefined): Promise<SessionSummary>{
	return apiRequest<SessionSummary>(`/sessions/${id}`);
}

export function getSessionOverview(id:string | undefined): Promise<SessionOverview>{
	return apiRequest<SessionOverview>(`/sessions/${id}/overview`);
}

