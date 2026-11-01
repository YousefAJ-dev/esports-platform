import { getEvents } from "../../api/eventsApi";
import EventCard from "../../components/ui/EventCards";
import { Link } from "react-router";
import StatusMessage from "../../components/ui/StatusMessage";
import { useAsyncData } from "../../hooks/useAsyncData";

function EventsPage() {

	const { data: events, errorMsg, isLoading } = useAsyncData(getEvents, "Failed to load event data", "events");

	if (isLoading || errorMsg || !events) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg} loadingText="Loading events..." />;
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

					<h1 className="header-text">
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

				<div className="flex justify-end">
					<Link 
					to={ `/events/new` }
					className="green-btn green-btn-clickable"
					>
						Add New
					</Link>
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