import { Link } from "react-router";
import { getMembers } from "../../api/membersApi";
import MemberCard from "../../components/ui/MemberCard";
import StatusMessage from "../../components/ui/StatusMessage";
import { useAsyncData } from "../../hooks/useAsyncData";

function MembersPage() {

	const { data: members, errorMsg, isLoading } = useAsyncData(getMembers, "Failed to load member data", "members");

	if (isLoading || errorMsg || !members) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg} loadingText="Loading members..." />;
	}

	return (
		<div className="main-content-layout">
			<div className="mx-auto max-w-7xl space-y-8">

				{/* Header */}
				<div className="header-box">
					<p className="text-sm font-medium text-purple-300">Members</p>
					<h1 className="header-text">Members</h1>
					<p className="mt-2 text-slate-400">An overview of the members that belong to this platform</p>
				</div>

				<div className="flex items-center justify-between">
					<div className="stat-card">
						<p className="light-text">Total Members</p>
						<p className="value-text">{members.length}</p>
					</div>
					<Link to="/members/new" className="green-btn green-btn-clickable">Add New</Link>
				</div>

				{members.length === 0 ? (
					<div className="stat-card">No members found.</div>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
						{members.map(member => <MemberCard key={member.member_id} member={member} />)}
					</div>
				)}
			</div>
		</div>
	);
}

export default MembersPage;
