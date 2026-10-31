import type { CreateUserPayload, UpdateUserPayload, UserOverview, UserSummary } from "../types/users";
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

export function deleteUserByID(id: string | undefined): Promise<unknown> {
	return apiRequest<unknown>(`/users/${id}`, { method: "DELETE" });
}
