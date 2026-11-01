import type { CreateUserPayload, Role, UpdateUserPayload, UserOverview, UserSummary } from "../types/users";
import { apiRequest } from "./apiClient";

export function getUsers(): Promise<UserSummary[]> {
	return apiRequest<UserSummary[]>('/users');
}

export function getUserByID(id: string | undefined): Promise<UserSummary> {
	return apiRequest<UserSummary>(`/users/${id}`);
}

export function getUserOverview(id: string | undefined): Promise<UserOverview> {
	return apiRequest<UserOverview>(`/users/${id}/overview`);
}

export function createUser(userData: CreateUserPayload): Promise<UserSummary> {
	return apiRequest<UserSummary>('/users', { method: "POST", body: JSON.stringify(userData) });
}

export function updateUserByID(id: string | undefined, updatedUser: UpdateUserPayload): Promise<UserSummary> {
	return apiRequest<UserSummary>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(updatedUser) });
}

// ---- Access (Admin-only on the server)

export function getRoles(): Promise<Role[]> {
	return apiRequest<Role[]>('/roles');
}

// Replaces all of a user's roles at once
export function updateUserRoles(id: string | undefined, roleIds: number[]): Promise<unknown> {
	return apiRequest<unknown>(`/users/${id}/roles`, { method: "PUT", body: JSON.stringify({ role_ids: roleIds }) });
}

// Sets the team a Team Manager runs; null unassigns them
export function updateUserTeam(id: string | undefined, teamId: number | null): Promise<unknown> {
	return apiRequest<unknown>(`/users/${id}/team`, { method: "PUT", body: JSON.stringify({ team_id: teamId }) });
}

export function deleteUserByID(id: string | undefined): Promise<unknown> {
	return apiRequest<unknown>(`/users/${id}`, { method: "DELETE" });
}
