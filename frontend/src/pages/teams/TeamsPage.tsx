import { Link } from "react-router";
import { getTeams } from "../../api/teamsApi";
import StatusMessage from "../../components/ui/StatusMessage";
import TeamCard from "../../components/ui/TeamCard";
import { useAsyncData } from "../../hooks/useAsyncData";

function TeamsPage() {

	const { data: teams, errorMsg, isLoading } = useAsyncData(getTeams, "Failed to load team data", "teams");

	if (isLoading || errorMsg || !teams) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg} loadingText="Loading teams..." />;
	}

	return (
		<div className="main-content-layout">
			<div className="mx-auto max-w-7xl space-y-8">

				{/* Header */}
				<div className="header-box">
					<p className="text-sm font-medium text-purple-300">Teams</p>
					<h1 className="header-text">Teams</h1>
					<p className="mt-2 text-slate-400">An overview of the teams that belong to this platform</p>
				</div>

				<div className="flex items-center justify-between">
					<div className="stat-card">
						<p className="light-text">Total Teams</p>
						<p className="value-text">{teams.length}</p>
					</div>
					<Link to="/teams/new" className="green-btn green-btn-clickable">Add New</Link>
				</div>

				{teams.length === 0 ? (
					<div className="stat-card">No teams found.</div>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
						{teams.map(team => <TeamCard key={team.team_id} team={team} />)}
					</div>
				)}
			</div>
		</div>
	);
}

export default TeamsPage;
