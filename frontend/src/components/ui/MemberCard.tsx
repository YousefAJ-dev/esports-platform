import { Link } from "react-router";
import type { MemberCardProp } from "../../types/members";

export function MemberCard({ member }: MemberCardProp) {

	return (
		<Link
			to={`/members/${member.member_id}`}
			className="stat-card stat-card-clickable"
		>
			<div className="stat-card-header">
				<div>
					<p className="stat-id">
						Member #{member.member_id}
					</p>

					<h2 className="mt-2 text-xl font-semibold text-white">
						{member.display_name}
					</h2>
				</div>

				<span className="status-pill">
					{member.is_active ? "Active" : "Inactive"}
				</span>
			</div>

			<div className="stat-body">
				<div>
					<p className="text-slate-500">Real Name</p>
					<p className="stat-field-value">
						{member.real_name}
					</p>
				</div>
			</div>

			<p className="stat-link-text">
				View details →
			</p>
		</Link>
	);
}

export default MemberCard;
