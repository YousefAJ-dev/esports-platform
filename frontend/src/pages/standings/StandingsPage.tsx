import { useSearchParams } from "react-router";
import { getEvents } from "../../api/eventsApi";
import { getStandings } from "../../api/standingsApi";
import PageHeader from "../../components/ui/PageHeader";
import StandingsTable from "../../components/ui/StandingsTable";
import StatusMessage from "../../components/ui/StatusMessage";
import { useAsyncData } from "../../hooks/useAsyncData";

function StandingsPage() {

	// The selected event lives in the URL (?event_id=) so a filtered table can be linked to
	const [searchParams, setSearchParams] = useSearchParams();
	const eventId = searchParams.get("event_id") ?? "";

	const { data: events } = useAsyncData(getEvents, "Error fetching events", "standings-events");

	const { data: standings, errorMsg, isLoading } = useAsyncData(
		() => getStandings(eventId || undefined),
		"Failed to load standings",
		eventId
	);

	const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSearchParams(e.target.value ? { event_id: e.target.value } : {});
	};

	return (
		<section className="mx-auto max-w-7xl space-y-6">
			<PageHeader
				title="Standings"
				description="Team records from completed matches, ranked by wins and then score difference."
			/>

			<label className="flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center">
				Event
				<select value={eventId} onChange={handleEventChange} className="purple-input-box sm:max-w-sm">
					<option value="">All events</option>
					{(events ?? []).map(event => (
						<option key={event.event_id} value={event.event_id}>{event.event_name}</option>
					))}
				</select>
			</label>

			{isLoading || errorMsg || !standings
				? <StatusMessage isLoading={isLoading} errorMsg={errorMsg} loadingText="Loading standings..." />
				: <StandingsTable standings={standings} />}
		</section>
	);
}

export default StandingsPage;
