import { Link } from "react-router";
import { getUsers } from "../../api/usersApi";
import StatusMessage from "../../components/ui/StatusMessage";
import UserCard from "../../components/ui/UserCard";
import { useAsyncData } from "../../hooks/useAsyncData";

function UsersPage() {

	const { data: users, errorMsg, isLoading } = useAsyncData(getUsers, "Failed to load user data", "users");

	if (isLoading || errorMsg || !users) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg} loadingText="Loading users..." />;
	}

	return (
		<div className="main-content-layout">
			<div className="mx-auto max-w-7xl space-y-8">

				{/* Header */}
				<div className="header-box">
					<p className="text-sm font-medium text-purple-300">Users</p>
					<h1 className="header-text">Users</h1>
					<p className="mt-2 text-slate-400">An overview of the users that manage this platform</p>
				</div>

				<div className="flex items-center justify-between">
					<div className="stat-card">
						<p className="light-text">Total Users</p>
						<p className="value-text">{users.length}</p>
					</div>
					<Link to="/users/new" className="green-btn green-btn-clickable">Add New</Link>
				</div>

				{users.length === 0 ? (
					<div className="stat-card">No users found.</div>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
						{users.map(user => <UserCard key={user.user_id} user={user} />)}
					</div>
				)}
			</div>
		</div>
	);
}

export default UsersPage;
