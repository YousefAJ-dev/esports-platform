export type UserSummary = {
	user_id: number,
	first_name: string,
	last_name: string,
	username: string,
	email: string,
	is_active: boolean
};

export type UserOverview = {
	real_name: string,
	username: string,
	roles: string[],
	role_ids: number[],
	email: string,
	// The team this user manages, if they're a Team Manager with a team
	managed_team_id: number | null,
	manager_of: string | null,
	is_active: boolean
};

export type Role = {
	role_id: number,
	role_name: string
};

export type UpdateUserPayload = Partial<Omit<UserSummary, "user_id">>;
// The backend hashes the password, so the client sends it in plain text over the API only on create
export type CreateUserPayload = Omit<UserSummary, "user_id"> & { password: string };

export type UserCardProp = {
	user: UserSummary
};
