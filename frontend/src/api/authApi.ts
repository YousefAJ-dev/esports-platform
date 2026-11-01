import type { AuthUser, LoginPayload } from "../types/auth";
import { apiRequest } from "./apiClient";

// The session lives in an httpOnly cookie the browser sends automatically,
// so these calls never handle a token themselves.
export function login(payload: LoginPayload): Promise<unknown> {
	return apiRequest<unknown>('/auth/login', { method: "POST", body: JSON.stringify(payload) });
}

export function logout(): Promise<unknown> {
	return apiRequest<unknown>('/auth/logout', { method: "POST" });
}

export function getMe(): Promise<AuthUser | null> {
	return apiRequest<AuthUser | null>('/auth/me');
}
