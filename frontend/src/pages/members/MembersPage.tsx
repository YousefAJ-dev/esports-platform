import { Link } from "react-router";
import { getMembers } from "../../api/membersApi";
import DataTable, { type Column } from "../../components/ui/DataTable";
import ListToolbar from "../../components/ui/ListToolbar";
import PageHeader from "../../components/ui/PageHeader";
import StatusMessage from "../../components/ui/StatusMessage";
import StatusPill from "../../components/ui/StatusPill";
import { useAsyncData } from "../../hooks/useAsyncData";
import { byText, useFilteredList } from "../../hooks/useFilteredList";
import type { MemberSummary } from "../../types/members";
import { useAuth } from "../../context/authContext";
import { canCreateMember } from "../../helper/permissions";

const COLUMNS: Column<MemberSummary>[] = [
	{ header: "Display Name", render: member => member.display_name },
	{ header: "Real Name", render: member => member.real_name, className: "hidden sm:table-cell" },
	{
		header: "Team",
		render: member => member.team_id
			? <Link to={`/teams/${member.team_id}`} onClick={e => e.stopPropagation()} className="hover:text-purple-300">{member.team_name}</Link>
			: <span className="text-slate-500">Free agent</span>
	},
	{ header: "Status", render: member => <StatusPill status={member.is_active ? "Active" : "Inactive"} /> },
];

function MembersList({ members }: { members: MemberSummary[] }) {

	const { user } = useAuth();

	const list = useFilteredList(members, {
		searchText: member => `${member.display_name} ${member.real_name} ${member.team_name ?? ""}`,
		getStatus: member => member.is_active ? "Active" : "Inactive",
		statusOrder: ["Active", "Inactive"],
		sorts: [
			{ label: "Display name A-Z", compare: byText(member => member.display_name) },
			{ label: "Real name A-Z", compare: byText(member => member.real_name) },
			{ label: "Team", compare: byText(member => member.team_name ?? "~") }, // free agents last
		]
	});

	return (
		<section className="mx-auto max-w-7xl space-y-6">
			<PageHeader
				title="Members"
				description="Players registered on the platform and the team they're on."
				count={members.length}
				action={canCreateMember(user) ? { label: "Add Member", to: "/members/new" } : undefined}
			/>

			<ListToolbar list={list} placeholder="Search by name or team..." />

			{list.results.length === 0 ? (
				<div className="stat-card text-slate-400">No members match your filters.</div>
			) : (
				<DataTable items={list.results} columns={COLUMNS} getKey={member => member.member_id} getLink={member => `/members/${member.member_id}`} />
			)}
		</section>
	);
}

function MembersPage() {

	const { data: members, errorMsg, isLoading } = useAsyncData(getMembers, "Failed to load member data", "members");

	if (isLoading || errorMsg || !members) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg} loadingText="Loading members..." />;
	}

	return <MembersList members={members} />;
}

export default MembersPage;
