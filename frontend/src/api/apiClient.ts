const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

		// Merge default headers with any custom headers.
		headers: {
			// Tell the backend we are sending JSON data.
			"Content-Type": "application/json",

			// Preserve extra headers from the caller if they exist.
			// useful for auth tokens.
			...options.headers,
		},
	});

	// If the backend returns 400, 404, 500, etc.,
	// throw an error so the page can catch it.
	if (!response.ok) {
		throw new Error(`API request failed with status ${response.status}`);
	}

	// Convert the JSON response into the TypeScript type T.
	// Example: EventSummary, EventSummary[], DashboardSummary, etc.
	return response.json();
}