import { createContext, useContext } from "react";
import type { AuthUser, LoginPayload } from "../types/auth";

export type AuthState = {
	user: AuthUser | null,          // null = visitor
	isLoading: boolean,             // true until /auth/me has answered once
	login: (payload: LoginPayload) => Promise<void>,
	logout: () => Promise<void>,
	refresh: () => Promise<void>    // reload /auth/me, e.g. after creating your team
};

export const AuthContext = createContext<AuthState | null>(null);

// Who is using the app right now. Must be inside <AuthProvider>.
export function useAuth(): AuthState {

	const auth = useContext(AuthContext);
	if (!auth) throw new Error("useAuth must be used inside <AuthProvider>");
	return auth;
}
