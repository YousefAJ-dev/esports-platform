import type { Standing } from "../types/standings";
import { apiRequest } from "./apiClient";

// Overall standings, or one event's when an ID is given
export function getStandings(eventId?: string | number): Promise<Standing[]> {
	return apiRequest<Standing[]>(eventId ? `/standings?event_id=${eventId}` : '/standings');
}
