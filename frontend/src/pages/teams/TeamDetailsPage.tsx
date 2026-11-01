import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { deleteTeamByID, getTeamOverview, getTeamRoster, removeTeamMember } from "../../api/teamsApi";
import AddPlayerForm from "../../components/ui/AddPlayerForm";
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
	// Bumped after a roster change so the overview, roster and member list reload
	const [rosterVersion, setRosterVersion] = useState<number>(0);
	const refreshRoster = () => setRosterVersion(v => v + 1);

	// Overview and roster are independent, so fetch them in parallel
	const { data, errorMsg, isLoading } = useAsyncData(
		async () => {
			const [overview, roster] = await Promise.all([getTeamOverview(id), getTeamRoster(id)]);
			return { overview, roster };
		},
		"Error fetching team data",
		`${id}:${rosterVersion}`
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

	const handleRemovePlayer = async (memberId: number, displayName: string) => {
		if (!window.confirm(`Remove ${displayName} from ${overview.team_name}?`)) return;

		try {
			await removeTeamMember(id, memberId);
			refreshRoster();
		} catch (error) {
			setActionError(error instanceof Error ? error.message : "Failed to remove player");
		}
	};

	const hasCaptain = roster.some(player => player.team_position === "Captain");

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
					<button type="button" onClick={handleDelete} className="red-btn">Delete</button>
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
								<div key={player.member_id} className="stat-card flex flex-col">
									<Link
										to={`/members/${player.member_id}`}
										state={{ trail: childTrail }}
										className="hover:text-purple-300"
									>
										<p className="light-text">{player.team_position}</p>
										<p className="value-text">{player.display_name}</p>
										<p className="mt-1 text-slate-400">{player.real_name} · since {convertDate(player.start_date)}</p>
									</Link>
									<button
										type="button"
										onClick={() => handleRemovePlayer(player.member_id, player.display_name)}
										className="mt-3 self-start text-sm text-slate-400 hover:text-purple-300"
									>
										Remove from team
									</button>
								</div>
							))}
						</div>
					)}
				</section>

				{/* Add Player - inactive teams can't take new players */}
				<section>
					<h2 className="mb-4 text-2xl font-semibold text-white">Add Player</h2>
					{overview.is_active ? (
						<AddPlayerForm teamId={id} hasCaptain={hasCaptain} refreshKey={rosterVersion} onAdded={refreshRoster} />
					) : (
						<div className="stat-card text-slate-400">This team is inactive, so players can't be added.</div>
					)}
				</section>
			</div>
		</div>
	);
}

export default TeamDetailsPage;
