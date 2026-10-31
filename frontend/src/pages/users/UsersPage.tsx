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
		<section className="main-content-layout">
			<div className="mx-auto max-w-7xl space-y-8">

				{/* Header */}
				<div className="header-box">
					<p className="text-sm font-medium text-purple-300">
						Users
					</p>

					<h1 className="header-text">
						Platform Users
					</h1>

					<p className="mt-2 text-slate-400">
						An overview of the users that manage this platform.
					</p>
				</div>

				{/* Summary Bar */}
				<div className="stat-card">
					<p className="stat-title">Total Users</p>
					<p className="mt-1 text-3xl font-bold text-white">
						{users.length}
					</p>
				</div>

				<div className="flex justify-end">
					<Link to="/users/new" className="green-btn green-btn-clickable">
						Add New
					</Link>
				</div>

				{/* Users Grid */}
				<main>
					{users.length === 0 ? (
						<div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
							No users found.
						</div>
					) : (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
							{users.map(user => <UserCard key={user.user_id} user={user} />)}
						</div>
					)}
				</main>
			</div>
		</section>
	);
}

export default UsersPage;
