import type { TeamSummary } from "../types/teams";
import { apiRequest } from "./apiClient";

export function getTeams():Promise<TeamSummary[]> {
	return apiRequest<TeamSummary[]>('/teams');
}