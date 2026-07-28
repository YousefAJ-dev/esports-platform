import { apiRequest } from "./apiClient";

export function getDashboard() {
	return apiRequest('/sessions');
}