import { Link } from "react-router";
import type { UserCardProp } from "../../types/users";
import StatusPill from "./StatusPill";

export function UserCard({ user }: UserCardProp) {

	return (
		<Link
			to={`/users/${user.user_id}`}
			className="stat-card stat-card-clickable"
		>
			<div className="stat-card-header">
				<div>
					<p className="stat-id">
						User #{user.user_id}
					</p>

					<h2 className="mt-2 text-xl font-semibold text-white">
						{user.username}
					</h2>
				</div>

				<StatusPill status={user.is_active ? "Active" : "Inactive"} />
			</div>

			<div className="stat-body">
				<div>
					<p className="text-slate-500">Name</p>
					<p className="stat-field-value">
						{`${user.first_name} ${user.last_name}`}
					</p>
				</div>
				<div>
					<p className="text-slate-500">Email</p>
					<p className="stat-field-value">
						{user.email}
					</p>
				</div>
			</div>

			<p className="stat-link-text">
				View details →
			</p>
		</Link>
	);
}

export default UserCard;
