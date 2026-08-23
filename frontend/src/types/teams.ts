export type TeamSummary = {
	team_id: number,
	team_name: string,
	contact_email: string;
	is_active: boolean
};

export type TeamCardProp = {
	team: TeamSummary
};