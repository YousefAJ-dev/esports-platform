import { Link } from "react-router";
import type { TeamCardProp } from "../../types/teams";
import StatusPill from "./StatusPill";

export function TeamCard({ team }: TeamCardProp) {

	return (
		<Link
			to={`/teams/${team.team_id}`}
			className="stat-card stat-card-clickable"
		>
			<div className="stat-card-header">
				<div>
					<p className="stat-id">
						Team #{team.team_id}
					</p>

					<h2 className="mt-2 text-xl font-semibold text-white">
						{team.team_name}
					</h2>
				</div>

				<StatusPill status={team.is_active ? "Active" : "Inactive"} />
			</div>

			<div className="stat-body">
				<div>
					<p className="text-slate-500">Contact Email</p>
					<p className="stat-field-value">
						{team.contact_email}
					</p>
				</div>
			</div>

			<p className="stat-link-text">
				View details →
			</p>
		</Link>
	);
}

export default TeamCard;
