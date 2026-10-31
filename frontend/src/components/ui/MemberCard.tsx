import { Link } from "react-router";
import type { MemberCardProp } from "../../types/members";

export function MemberCard({ member }: MemberCardProp) {

	return (
		<Link to={`/members/${member.member_id}`} className="stat-card stat-card-clickable">
			<p className="stat-id">Member ID: {member.member_id}</p>
			<p>Display Name: {member.display_name}</p>
			<p>Real Name: {member.real_name}</p>
			<p>Member Activity: {member.is_active ? "Active" : "Inactive"}</p>
		</Link>
	);
}

export default MemberCard;
