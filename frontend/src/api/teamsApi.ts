import type { CreateTeamPayload, TeamOverview, TeamRosterEntry, TeamSummary, UpdateTeamPayload } from "../types/teams";
import { apiRequest } from "./apiClient";

export function getTeams(): Promise<TeamSummary[]> {
	return apiRequest<TeamSummary[]>('/teams');
}

export function getTeamByID(id: string | undefined): Promise<TeamSummary> {
	return apiRequest<TeamSummary>(`/teams/${id}`);
}

export function getTeamOverview(id: string | undefined): Promise<TeamOverview> {
	return apiRequest<TeamOverview>(`/teams/${id}/overview`);
}

export function getTeamRoster(id: string | undefined): Promise<TeamRosterEntry[]> {
	return apiRequest<TeamRosterEntry[]>(`/teams/${id}/roster`);
}

export function createTeam(teamData: CreateTeamPayload): Promise<TeamSummary> {
	return apiRequest<TeamSummary>('/teams', { method: "POST", body: JSON.stringify(teamData) });
}

export function updateTeamByID(id: string | undefined, updatedTeam: UpdateTeamPayload): Promise<TeamSummary> {
	return apiRequest<TeamSummary>(`/teams/${id}`, { method: "PATCH", body: JSON.stringify(updatedTeam) });
}

export function deleteTeamByID(id: string | undefined): Promise<unknown> {
	return apiRequest<unknown>(`/teams/${id}`, { method: "DELETE" });
}
