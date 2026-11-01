import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import * as authApi from "../api/authApi";
import { AUTH_EXPIRED_EVENT } from "../api/apiClient";
import type { AuthUser, LoginPayload } from "../types/auth";
import { AuthContext } from "./authContext";

// Holds the logged-in user for the whole app. The server stays the real gatekeeper;
// this only tells the UI what to show.
export function AuthProvider({ children }: { children: ReactNode }) {

	const [user, setUser] = useState<AuthUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const refresh = useCallback(async () => {
		try {
			setUser(await authApi.getMe());
		} catch {
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Ask once on load whether the browser already has a valid session cookie
	useEffect(() => {
		let cancelled = false;

		authApi.getMe()
			.then(me => { if (!cancelled) setUser(me); })
			.catch(() => { if (!cancelled) setUser(null); })
			.finally(() => { if (!cancelled) setIsLoading(false); });

		return () => { cancelled = true; };
	}, []);

	// Any request answered with 401 means the session ended (expired, logged out elsewhere, deactivated)
	useEffect(() => {
		const handleExpired = () => setUser(null);
		window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
		return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
	}, []);

	const login = useCallback(async (payload: LoginPayload) => {
		await authApi.login(payload);
		await refresh();
	}, [refresh]);

	const logout = useCallback(async () => {
		await authApi.logout();
		setUser(null);
	}, []);

	const value = useMemo(() => ({ user, isLoading, login, logout, refresh }), [user, isLoading, login, logout, refresh]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
