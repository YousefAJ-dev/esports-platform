import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { deleteTeamByID, getTeamOverview, getTeamRoster } from "../../api/teamsApi";
import DetailCard from "../../components/ui/DetailCard";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import StatusMessage from "../../components/ui/StatusMessage";
import { convertDate } from "../../helper/helperFunctions";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useBreadcrumbTrail } from "../../hooks/useBreadcrumbTrail";

export function TeamDetailsPage() {

	const { id } = useParams();
	const navigate = useNavigate();
	const [actionError, setActionError] = useState<string | null>(null);

	// Overview and roster are independent, so fetch them in parallel
	const { data, errorMsg, isLoading } = useAsyncData(
		async () => {
			const [overview, roster] = await Promise.all([getTeamOverview(id), getTeamRoster(id)]);
			return { overview, roster };
		},
		"Error fetching team data",
		id
	);

	const teamName = data?.overview.team_name ?? `Team #${id}`;
	const { trail, childTrail } = useBreadcrumbTrail([{ label: "Teams", to: "/teams" }], teamName);

	if (isLoading || errorMsg || !data) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg ?? "Team not found"} loadingText="Loading team..." />;
	}

	const { overview, roster } = data;

	const handleDelete = async () => {
		// Deleting is permanent, so confirm first
		if (!window.confirm(`Delete ${overview.team_name}?`)) return;

		try {
			await deleteTeamByID(id);
			navigate("/teams");
		} catch (error) {
			setActionError(error instanceof Error ? error.message : "Failed to delete team");
		}
	};

	const captain = overview.team_captain_dname
		? `${overview.team_captain_dname} (${overview.team_captain_rname})`
		: null;

	return (
		<div className="min-h-screen bg-slate-950 p-6 text-slate-100">
			<div className="mx-auto max-w-6xl space-y-8">

				<Breadcrumbs trail={trail} current={teamName} />

				{/* Header */}
				<div className="header-box">
					<p className="text-sm font-medium text-purple-300">Team #{id}</p>
					<h1 className="header-text">{overview.team_name}</h1>
				</div>

				<div className="flex justify-end gap-4">
					<Link to={`/teams/${id}/edit`} className="green-btn green-btn-clickable">Edit</Link>
					<button type="button" onClick={handleDelete} className="green-btn green-btn-clickable">Delete</button>
				</div>

				{actionError && <div className="stat-card">{actionError}</div>}

				{/* Team Overview */}
				<section>
					<h2 className="mb-4 text-2xl font-semibold text-white">Team Overview</h2>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<DetailCard title="Contact Email" value={overview.contact_email} />
						<DetailCard title="Team Activity" value={overview.is_active} highlight />
						<DetailCard title="Managed By" value={overview.user_realname} />
						<DetailCard title="Team Captain" value={captain} />
						<DetailCard title="Active Players" value={overview.active_player_count} />
						<DetailCard title="Events Participated" value={overview.total_events_participated} />
						<DetailCard title="Total Matches" value={overview.total_matches} />
						<DetailCard title="Matches Played" value={overview.matches_played} />
						<DetailCard title="Matches In Progress" value={overview.matches_in_progress} />
						<DetailCard title="Upcoming Matches" value={overview.upcoming_matches} />
					</div>
				</section>

				{/* Roster */}
				<section>
					<h2 className="mb-4 text-2xl font-semibold text-white">Current Roster</h2>
					{roster.length === 0 ? (
						<div className="stat-card">No players on this team.</div>
					) : (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{roster.map(player => (
								<Link
									key={player.member_id}
									to={`/members/${player.member_id}`}
									state={{ trail: childTrail }}
									className="stat-card stat-card-clickable"
								>
									<p className="light-text">{player.team_position}</p>
									<p className="value-text">{player.display_name}</p>
									<p className="mt-1 text-slate-400">{player.real_name} · since {convertDate(player.start_date)}</p>
								</Link>
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}

export default TeamDetailsPage;
