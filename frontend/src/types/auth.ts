// The logged-in user from GET /auth/me (null for visitors)
export type AuthUser = {
	user_id: number,
	username: string,
	first_name: string,
	last_name: string,
	roles: string[],
	// Set for a Team Manager who runs a team (from team_users)
	managed_team_id: number | null
};

export type LoginPayload = {
	username: string,
	password: string
};
