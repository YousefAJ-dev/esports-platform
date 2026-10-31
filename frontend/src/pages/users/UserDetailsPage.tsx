import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { deleteUserByID, getUserOverview } from "../../api/usersApi";
import StatCard from "../../components/ui/StatCard";
import StatusMessage from "../../components/ui/StatusMessage";
import { useAsyncData } from "../../hooks/useAsyncData";

export function UserDetailsPage() {

	const { id } = useParams();
	const navigate = useNavigate();
	const [actionError, setActionError] = useState<string | null>(null);

	const { data: user, errorMsg, isLoading } = useAsyncData(
		() => getUserOverview(id), "Error fetching user data", id
	);

	if (isLoading || errorMsg || !user) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg ?? "User not found"} loadingText="Loading user..." />;
	}

	const handleDelete = async () => {
		// Deleting is permanent, so confirm first
		if (!window.confirm(`Delete ${user.username}?`)) return;

		try {
			await deleteUserByID(id);
			navigate("/users");
		} catch (error) {
			setActionError(error instanceof Error ? error.message : "Failed to delete user");
		}
	};

	return (
		<div className="min-h-screen bg-slate-950 p-6 text-slate-100">
			<div className="mx-auto max-w-6xl space-y-8">

				{/* Header */}
				<div className="header-box">
					<p className="text-sm font-medium text-purple-300">User #{id}</p>
					<h1 className="header-text">{user.username}</h1>
				</div>

				<div className="flex justify-end gap-4">
					<Link to={`/users/${id}/edit`} className="green-btn green-btn-clickable">Edit</Link>
					<button type="button" onClick={handleDelete} className="green-btn green-btn-clickable">Delete</button>
				</div>

				{actionError && <div className="stat-card">{actionError}</div>}

				{/* User Overview */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<StatCard title="Real Name" value={user.real_name} />
					<StatCard title="Username" value={user.username} />
					<StatCard title="Role" value={user.role_name} />
					<StatCard title="Email" value={user.email} />
					<StatCard title="Manager Of" value={user.manager_of} />
					<StatCard title="User Activity" value={user.is_active} />
				</div>
			</div>
		</div>
	);
}

export default UserDetailsPage;
