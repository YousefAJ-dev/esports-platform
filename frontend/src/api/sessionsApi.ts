import type { CreateSessionPayload, MatchResult, MatchResultPayload, SessionOverview, SessionSummary, SessionTeam, UpdateSessionPayload } from "../types/sessions";
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

export function updateSessionByID(
	id: string, updatedPayload: UpdateSessionPayload ): Promise<UpdateSessionPayload>
{
	
		return apiRequest<UpdateSessionPayload>(`/sessions/${id}`, {
			method: "PATCH",
			body: JSON.stringify(updatedPayload),
		}
	);
}

export function createSession(
	sessionData: CreateSessionPayload): Promise<SessionSummary>
{
		return apiRequest<SessionSummary>(`/sessions/`, {
			method: "POST",
			body: JSON.stringify(sessionData),
		}
	);
}

export function getSessionTeams(id: string | undefined): Promise<SessionTeam[]> {
	return apiRequest<SessionTeam[]>(`/sessions/${id}/teams`);
}

// Saves every team's score/winner for a match in one request
export function updateSessionResults(id: string | undefined, payload: MatchResultPayload): Promise<MatchResult[]> {
	return apiRequest<MatchResult[]>(`/sessions/${id}/results`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
}
