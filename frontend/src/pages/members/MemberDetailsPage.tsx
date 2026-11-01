import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { deleteMemberByID, getMemberOverview, updateMemberByID } from "../../api/membersApi";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import DetailCard from "../../components/ui/DetailCard";
import FormError from "../../components/ui/FormError";
import StatusMessage from "../../components/ui/StatusMessage";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useBreadcrumbTrail } from "../../hooks/useBreadcrumbTrail";

export function MemberDetailsPage() {

	const { id } = useParams();
	const navigate = useNavigate();
	const [actionError, setActionError] = useState<string | null>(null);
	// Bumped after activating/deactivating so the overview reloads
	const [version, setVersion] = useState(0);

	const { data: member, errorMsg, isLoading } = useAsyncData(
		() => getMemberOverview(id), "Error fetching member data", `${id}:${version}`
	);

	const memberName = member?.display_name ?? `Member #${id}`;
	const { trail, childTrail } = useBreadcrumbTrail([{ label: "Members", to: "/members" }], memberName);

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

	const handleToggleActive = async () => {
		// Deactivating also ends their current team membership, so say so first
		if (member.is_active && member.team_name && !window.confirm(`Deactivate ${member.display_name}? They'll be removed from ${member.team_name}.`)) return;

		try {
			await updateMemberByID(id, { is_active: !member.is_active });
			setActionError(null);
			setVersion(v => v + 1);
		} catch (error) {
			setActionError(error instanceof Error ? error.message : "Failed to update member");
		}
	};

	return (
		<div>
			<div className="mx-auto max-w-6xl space-y-8">

				<Breadcrumbs trail={trail} current={memberName} />

				{/* Header */}
				<div className="header-box">
					<p className="text-sm font-medium text-purple-300">Member #{id}</p>
					<h1 className="header-text">{member.display_name}</h1>
				</div>

				<div className="flex justify-end gap-4">
					<Link to={`/members/${id}/edit`} className="green-btn green-btn-clickable">Edit</Link>
					<button type="button" onClick={handleToggleActive} className="ghost-btn">{member.is_active ? "Deactivate" : "Reactivate"}</button>
					<button type="button" onClick={handleDelete} className="red-btn">Delete</button>
				</div>

				<FormError message={actionError} />

				{/* Member Overview */}
				<section>
					<h2 className="mb-4 text-2xl font-semibold text-white">
						Member Overview
					</h2>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<DetailCard title="Real Name" value={member.real_name} />
						<DetailCard title="Display Name" value={member.display_name} />
						{/* Current team links through when the member is on one */}
						{member.team_id ? (
							<Link to={`/teams/${member.team_id}`} state={{ trail: childTrail }} className="stat-card stat-card-clickable">
								<p className="light-text">Current Team</p>
								<p className="value-text">{member.team_name}</p>
							</Link>
						) : (
							<DetailCard title="Current Team" value={member.team_name} />
						)}
						<DetailCard title="Age" value={member.age} />
						<DetailCard title="Team Position" value={member.team_position} />
						<DetailCard title="Member Activity" value={member.is_active} highlight />
						<DetailCard title="Matches Played with Current Team" value={member.matches_played_with_current_team} />
						<DetailCard title="Events Participated with Current Team" value={member.events_participated_with_current_team} />
					</div>
				</section>
			</div>
		</div>
	);
}

export default MemberDetailsPage;
