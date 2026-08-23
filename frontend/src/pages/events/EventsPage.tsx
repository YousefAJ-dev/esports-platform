import { useEffect, useState } from "react";
import { getEvents } from "../../api/eventsApi";
import type { EventSummary } from "../../types/events";
import EventCard from "../../components/ui/EventCards";

function EventsPage() {
	const [events, setEvents] = useState<EventSummary[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadEventData() {
			try {
				const data = await getEvents();
				setEvents(data);
			} catch {
				setError("Failed to load event data");
			} finally {
				setIsLoading(false);
			}
		}

		loadEventData();
	}, []);

	if (isLoading) {
		return (
			<section className="min-h-screen bg-slate-950 p-6 text-slate-100">
				<p className="text-purple-300">Loading events...</p>
			</section>
		);
	}

	if (error) {
		return (
			<section className="min-h-screen bg-slate-950 p-6 text-slate-100">
				<div className="stat-card">
					{error}
				</div>
			</section>
		);
	}

	const eventsList = events.map((event) => (
		<EventCard
			key={event.event_id}
			event={event}
		/>
	));

	return (
		<section className="main-content-layout">
			<div className="mx-auto max-w-7xl space-y-8">

				{/* Header */}
				<div className="header-box">
					<p className="text-sm font-medium text-purple-300">
						Events
					</p>

					<h1 className="mt-2 text-4xl font-bold text-white">
						Platform Events
					</h1>

					<p className="mt-2 text-slate-400">
						An overview of events that belong to this platform.
					</p>
				</div>

				{/* Summary Bar */}
				<div className="stat-card">
					<p className="stat-title">Total Events</p>
					<p className="mt-1 text-3xl font-bold text-white">
						{events.length}
					</p>
				</div>

				{/* Events Grid */}
				<main>
					{events.length === 0 ? (
						<div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
							No events found.
						</div>
					) : (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
							{eventsList}
						</div>
					)}
				</main>
			</div>
		</section>
	);
}

export default EventsPage;