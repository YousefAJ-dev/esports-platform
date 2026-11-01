import { getTeams } from "../../api/teamsApi";
import ListToolbar from "../../components/ui/ListToolbar";
import PageHeader from "../../components/ui/PageHeader";
import StatusMessage from "../../components/ui/StatusMessage";
import TeamCard from "../../components/ui/TeamCard";
import { useAsyncData } from "../../hooks/useAsyncData";
import { byText, useFilteredList } from "../../hooks/useFilteredList";
import type { TeamSummary } from "../../types/teams";

function TeamsList({ teams }: { teams: TeamSummary[] }) {

	const list = useFilteredList(teams, {
		searchText: team => `${team.team_name} ${team.contact_email}`,
		getStatus: team => team.is_active ? "Active" : "Inactive",
		statusOrder: ["Active", "Inactive"],
		sorts: [
			{ label: "Name A-Z", compare: byText(team => team.team_name) },
			{ label: "Name Z-A", compare: (a, b) => b.team_name.localeCompare(a.team_name) },
		]
	});

	return (
		<section className="mx-auto max-w-7xl space-y-6">
			<PageHeader
				title="Teams"
				description="Teams that compete on the platform."
				count={teams.length}
				action={{ label: "Add Team", to: "/teams/new" }}
			/>

			<ListToolbar list={list} placeholder="Search teams or emails..." />

			{list.results.length === 0 ? (
				<div className="stat-card text-slate-400">No teams match your filters.</div>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
					{list.results.map(team => <TeamCard key={team.team_id} team={team} />)}
				</div>
			)}
		</section>
	);
}

function TeamsPage() {

	const { data: teams, errorMsg, isLoading } = useAsyncData(getTeams, "Failed to load team data", "teams");

	if (isLoading || errorMsg || !teams) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg} loadingText="Loading teams..." />;
	}

	return <TeamsList teams={teams} />;
}

export default TeamsPage;
