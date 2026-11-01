export type MemberSummary = {
	member_id: number,
	real_name: string,
	display_name: string,
	date_of_birth?: string,
	created_on?: string,
	is_active: boolean
};

export type MemberOverview = {
	real_name: string,
	display_name: string,
	team_id: number | null,
	team_name: string | null,
	age: number,
	team_position: string | null,
	is_active: boolean,
	matches_played_with_current_team: number | null,
	events_participated_with_current_team: number | null
};

export type UpdateMemberPayload = Partial<Omit<MemberSummary, "member_id" | "created_on">>;
export type CreateMemberPayload = {
	real_name: string,
	display_name: string,
	date_of_birth: string,
	is_active: boolean
};

export type MemberCardProp = {
	member: MemberSummary
};
