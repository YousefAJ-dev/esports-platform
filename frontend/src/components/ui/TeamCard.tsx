import { Link } from "react-router";
import type { TeamCardProp } from "../../types/teams";

export function TeamCard( {team}: TeamCardProp ){

	const is_active = team.is_active === true ? "Active" : "Inactive"

	return(
		<Link to={`/teams/${team.team_id}`} className="stat-card stat-card-clickable">
			<p className="stat-id">Team ID: {team.team_id}</p>
			<p>Team Name: {team.team_name}</p>
			<p>Team Email: {team.contact_email}</p>
			<p>Team Activity: {is_active}</p>
		</Link>
	);

};

export default TeamCard;
