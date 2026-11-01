const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Fired when the server answers 401 (session expired or ended); AuthProvider listens for it
export const AUTH_EXPIRED_EVENT = "auth:expired";

// export
export async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<T> {

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		// Add any custom fetch options.
		// GET requests may not pass anything.
		// PATCH/POST requests may pass method and body.
		...options,

		// Send the session cookie with every request, including when the API is on another origin.
		// The cookie is httpOnly, so this code never sees its value; the browser just attaches it.
		credentials: "include",

		// Merge default headers with any custom headers.
		headers: {
			// Tell the backend we are sending JSON data.
			"Content-Type": "application/json",

			// Preserve extra headers from the caller if they exist.
			...options.headers,
		},
	});

	// If the backend returns 400, 404, 500, etc.,
	// throw an error so the page can catch it.
	if (!response.ok) {
		// A 401 anywhere except the login call itself means we're no longer logged in
		if (response.status === 401 && endpoint !== '/auth/login') {
			window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
		}

		// Prefer the backend's error message when it sends one
		const body = await response.json().catch(() => null);
		throw new Error(body?.error ?? `API request failed with status ${response.status}`);
	}

	// Convert the JSON response into the TypeScript type T.
	// Example: EventSummary, EventSummary[], DashboardSummary, etc.
	return response.json();
}
