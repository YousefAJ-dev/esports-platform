import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { deleteMemberByID, getMemberOverview } from "../../api/membersApi";
import StatCard from "../../components/ui/StatCard";
import StatusMessage from "../../components/ui/StatusMessage";
import { useAsyncData } from "../../hooks/useAsyncData";

export function MemberDetailsPage() {

	const { id } = useParams();
	const navigate = useNavigate();
	const [actionError, setActionError] = useState<string | null>(null);

	const { data: member, errorMsg, isLoading } = useAsyncData(
		() => getMemberOverview(id), "Error fetching member data", id
	);

	if (isLoading || errorMsg || !member) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg ?? "Member not found"} loadingText="Loading member..." />;
	}

	const handleDelete = async () => {
		// Deleting is permanent, so confirm first
		if (!window.confirm(`Delete ${member.display_name}?`)) return;

		try {
			await deleteMemberByID(id);
			navigate("/members");
		} catch (error) {
			setActionError(error instanceof Error ? error.message : "Failed to delete member");
		}
	};

	return (
		<div className="min-h-screen bg-slate-950 p-6 text-slate-100">
			<div className="mx-auto max-w-6xl space-y-8">

				{/* Header */}
				<div className="header-box">
					<p className="text-sm font-medium text-purple-300">Member #{id}</p>
					<h1 className="header-text">{member.display_name}</h1>
				</div>

				<div className="flex justify-end gap-4">
					<Link to={`/members/${id}/edit`} className="green-btn green-btn-clickable">Edit</Link>
					<button type="button" onClick={handleDelete} className="green-btn green-btn-clickable">Delete</button>
				</div>

				{actionError && <div className="stat-card">{actionError}</div>}

				{/* Member Overview */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<StatCard title="Real Name" value={member.real_name} />
					<StatCard title="Display Name" value={member.display_name} />
					<StatCard title="Current Team" value={member.team_name} />
					<StatCard title="Age" value={member.age} />
					<StatCard title="Team Position" value={member.team_position} />
					<StatCard title="Member Activity" value={member.is_active} />
					<StatCard title="Matches Played with Current Team" value={member.matches_played_with_current_team} />
					<StatCard title="Events Participated with Current Team" value={member.events_participated_with_current_team} />
				</div>
			</div>
		</div>
	);
}

export default MemberDetailsPage;
