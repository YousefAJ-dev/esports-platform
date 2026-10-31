import { Link } from "react-router";
import type { UserCardProp } from "../../types/users";

export function UserCard({ user }: UserCardProp) {

	return (
		<Link to={`/users/${user.user_id}`} className="stat-card stat-card-clickable">
			<p className="stat-id">User ID: {user.user_id}</p>
			<p>Name: {user.first_name} {user.last_name}</p>
			<p>Username: {user.username}</p>
			<p>User Activity: {user.is_active ? "Active" : "Inactive"}</p>
		</Link>
	);
}

export default UserCard;
