import { getEvents } from "../../api/eventsApi";
import EventCard from "../../components/ui/EventCards";
import ListToolbar from "../../components/ui/ListToolbar";
import PageHeader from "../../components/ui/PageHeader";
import StatusMessage from "../../components/ui/StatusMessage";
import { useAsyncData } from "../../hooks/useAsyncData";
import { byDate, byText, useFilteredList } from "../../hooks/useFilteredList";
import type { EventSummary } from "../../types/events";
import { useAuth } from "../../context/authContext";
import { canCreateEvent } from "../../helper/permissions";

const STATUSES = ["Upcoming", "In-Progress", "Completed", "Cancelled"];

function EventsList({ events }: { events: EventSummary[] }) {

	const { user } = useAuth();

	const list = useFilteredList(events, {
		searchText: event => `${event.event_name} ${event.location} ${event.description ?? ""}`,
		getStatus: event => event.status,
		statusOrder: STATUSES,
		sorts: [
			{ label: "Newest first", compare: byDate(event => event.start_on, -1) },
			{ label: "Oldest first", compare: byDate(event => event.start_on) },
			{ label: "Name A-Z", compare: byText(event => event.event_name) },
		]
	});

	return (
		<section className="mx-auto max-w-7xl space-y-6">
			<PageHeader
				title="Events"
				description="Tournaments and the matches played in them."
				count={events.length}
				action={canCreateEvent(user) ? { label: "Add Event", to: "/events/new" } : undefined}
			/>

			<ListToolbar list={list} placeholder="Search events or locations..." />

			{list.results.length === 0 ? (
				<div className="stat-card text-slate-400">No events match your filters.</div>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
					{list.results.map(event => <EventCard key={event.event_id} event={event} />)}
				</div>
			)}
		</section>
	);
}

function EventsPage() {

	const { data: events, errorMsg, isLoading } = useAsyncData(getEvents, "Failed to load event data", "events");

	if (isLoading || errorMsg || !events) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg} loadingText="Loading events..." />;
	}

	return <EventsList events={events} />;
}

export default EventsPage;
