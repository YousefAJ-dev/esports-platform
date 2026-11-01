import { getSessions } from "../../api/sessionsApi";
import ListToolbar from "../../components/ui/ListToolbar";
import MatchCard from "../../components/ui/MatchCard";
import PageHeader from "../../components/ui/PageHeader";
import StatusMessage from "../../components/ui/StatusMessage";
import { useAsyncData } from "../../hooks/useAsyncData";
import { byDate, useFilteredList } from "../../hooks/useFilteredList";
import type { Crumb } from "../../types/navigation";
import type { EventMatch } from "../../types/sessions";

const STATUSES = ["Upcoming", "In-Progress", "Completed", "Cancelled"];
const TRAIL: Crumb[] = [{ label: "Matches", to: "/sessions" }];

function MatchesList({ matches }: { matches: EventMatch[] }) {

	const list = useFilteredList(matches, {
		// Team names are searchable so "Titans" finds every match a team played
		searchText: match => `${match.event_name} ${match.session_type} ${match.teams.map(team => team.team_name).join(" ")}`,
		getStatus: match => match.status,
		statusOrder: STATUSES,
		sorts: [
			{ label: "Soonest first", compare: byDate(match => match.scheduled_start) },
			{ label: "Latest first", compare: byDate(match => match.scheduled_start, -1) },
		]
	});

	return (
		<section className="mx-auto max-w-7xl space-y-6">
			<PageHeader
				title="Matches"
				description="Every match across all events, with teams and scores."
				count={matches.length}
				action={{ label: "Add Match", to: "/sessions/new" }}
			/>

			<ListToolbar list={list} placeholder="Search by event, round or team..." />

			{list.results.length === 0 ? (
				<div className="stat-card text-slate-400">No matches match your filters.</div>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
					{list.results.map(match => <MatchCard key={match.session_id} match={match} trail={TRAIL} showEvent />)}
				</div>
			)}
		</section>
	);
}

function SessionsPage() {

	const { data: matches, errorMsg, isLoading } = useAsyncData(getSessions, "Failed to load match data", "sessions");

	if (isLoading || errorMsg || !matches) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg} loadingText="Loading matches..." />;
	}

	return <MatchesList matches={matches} />;
}

export default SessionsPage;
