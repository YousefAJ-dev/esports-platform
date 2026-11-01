import { getUsers } from "../../api/usersApi";
import DataTable, { type Column } from "../../components/ui/DataTable";
import ListToolbar from "../../components/ui/ListToolbar";
import PageHeader from "../../components/ui/PageHeader";
import StatusMessage from "../../components/ui/StatusMessage";
import StatusPill from "../../components/ui/StatusPill";
import { useAsyncData } from "../../hooks/useAsyncData";
import { byText, useFilteredList } from "../../hooks/useFilteredList";
import type { UserSummary } from "../../types/users";

const COLUMNS: Column<UserSummary>[] = [
	{ header: "Username", render: user => user.username },
	{ header: "Name", render: user => `${user.first_name} ${user.last_name}` },
	{ header: "Email", render: user => user.email, className: "hidden md:table-cell" },
	{ header: "Status", render: user => <StatusPill status={user.is_active ? "Active" : "Inactive"} /> },
];

function UsersList({ users }: { users: UserSummary[] }) {

	const list = useFilteredList(users, {
		searchText: user => `${user.username} ${user.first_name} ${user.last_name} ${user.email}`,
		getStatus: user => user.is_active ? "Active" : "Inactive",
		statusOrder: ["Active", "Inactive"],
		sorts: [
			{ label: "Username A-Z", compare: byText(user => user.username) },
			{ label: "Last name A-Z", compare: byText(user => user.last_name) },
		]
	});

	return (
		<section className="mx-auto max-w-7xl space-y-6">
			<PageHeader
				title="Users"
				description="Staff accounts that manage the platform."
				count={users.length}
				action={{ label: "Add User", to: "/users/new" }}
			/>

			<ListToolbar list={list} placeholder="Search by username, name or email..." />

			{list.results.length === 0 ? (
				<div className="stat-card text-slate-400">No users match your filters.</div>
			) : (
				<DataTable items={list.results} columns={COLUMNS} getKey={user => user.user_id} getLink={user => `/users/${user.user_id}`} />
			)}
		</section>
	);
}

function UsersPage() {

	const { data: users, errorMsg, isLoading } = useAsyncData(getUsers, "Failed to load user data", "users");

	if (isLoading || errorMsg || !users) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg} loadingText="Loading users..." />;
	}

	return <UsersList users={users} />;
}

export default UsersPage;
