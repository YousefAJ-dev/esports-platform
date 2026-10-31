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
	role_name: string | null,
	email: string,
	manager_of: string | null,
	is_active: boolean
};

export type UpdateUserPayload = Partial<Omit<UserSummary, "user_id">>;
// The backend hashes the password, so the client sends it in plain text over the API only on create
export type CreateUserPayload = Omit<UserSummary, "user_id"> & { password: string };

export type UserCardProp = {
	user: UserSummary
};
