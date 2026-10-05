import type { CreateSessionPayload, SessionOverview, SessionSummary, UpdateSessionPayload } from "../types/sessions";
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

