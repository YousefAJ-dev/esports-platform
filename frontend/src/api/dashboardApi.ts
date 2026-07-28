import { apiRequest } from "./apiClient";
import type { DashboardSummary } from "../types/dashboard"; // This imports only the TypeScript type.
// This import is only for type-checking, not runtime JavaScript.

export function getDashboard() {
	return apiRequest<DashboardSummary>('/dashboard');
}