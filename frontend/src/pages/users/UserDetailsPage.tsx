import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { deleteUserByID, getUserOverview, updateUserByID } from "../../api/usersApi";
import DetailCard from "../../components/ui/DetailCard";
import FormError from "../../components/ui/FormError";
import StatusMessage from "../../components/ui/StatusMessage";
import { useAsyncData } from "../../hooks/useAsyncData";

export function UserDetailsPage() {

	const { id } = useParams();
	const navigate = useNavigate();
	const [actionError, setActionError] = useState<string | null>(null);
	// Bumped after activating/deactivating so the overview reloads
	const [version, setVersion] = useState(0);

	const { data: user, errorMsg, isLoading } = useAsyncData(
		() => getUserOverview(id), "Error fetching user data", `${id}:${version}`
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

	const handleToggleActive = async () => {
		try {
			await updateUserByID(id, { is_active: !user.is_active });
			setActionError(null);
			setVersion(v => v + 1);
		} catch (error) {
			setActionError(error instanceof Error ? error.message : "Failed to update user");
		}
	};

	return (
		<div>
			<div className="mx-auto max-w-6xl space-y-8">

				{/* Header */}
				<div className="header-box">
					<p className="text-sm font-medium text-purple-300">User #{id}</p>
					<h1 className="header-text">{user.username}</h1>
				</div>

				<div className="flex justify-end gap-4">
					<Link to={`/users/${id}/edit`} className="green-btn green-btn-clickable">Edit</Link>
					<button type="button" onClick={handleToggleActive} className="ghost-btn">{user.is_active ? "Deactivate" : "Reactivate"}</button>
					<button type="button" onClick={handleDelete} className="red-btn">Delete</button>
				</div>

				<FormError message={actionError} />

				{/* User Overview */}
				<section>
					<h2 className="mb-4 text-2xl font-semibold text-white">
						User Overview
					</h2>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<DetailCard title="Real Name" value={user.real_name} />
						<DetailCard title="Username" value={user.username} />
						<DetailCard title="Role" value={user.role_name} />
						<DetailCard title="Email" value={user.email} />
						<DetailCard title="Manager Of" value={user.manager_of} />
						<DetailCard title="User Activity" value={user.is_active} highlight />
					</div>
				</section>
			</div>
		</div>
	);
}

export default UserDetailsPage;
