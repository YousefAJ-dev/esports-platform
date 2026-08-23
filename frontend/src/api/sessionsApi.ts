import type { SessionSummary } from "../types/sessions";
import { apiRequest } from "./apiClient";

export function getSessions(): Promise<SessionSummary[]> {
	return apiRequest<SessionSummary[]>('/sessions');
}