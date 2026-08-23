import type { TeamCardProp } from "../../types/teams";

export function TeamCard( {team}: TeamCardProp ){

	const is_active = team.is_active === true ? "Active" : "Inactive"

	return(
		<div className="stat-card">
			<p className="stat-id">Team ID: {team.team_id}</p>
			<p>Team Name: {team.team_name}</p>
			<p>Team Email: {team.contact_email}</p>
			<p>Team Activity: {is_active}</p>
		</div>
	);

};

export default TeamCard;