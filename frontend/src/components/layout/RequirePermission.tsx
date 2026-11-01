import type { ReactNode } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router";
import { useAuth } from "../../context/authContext";
import type { AuthUser } from "../../types/auth";

type RequirePermissionProps = {
	// Receives the logged-in user and the route's :params (e.g. params.id for /teams/:id/edit)
	allow?: (user: AuthUser, params: Record<string, string | undefined>) => boolean,
	children: ReactNode
};

// Route guard. Visitors are sent to the login page (and brought back afterwards);
// logged-in users without permission get a friendly page instead of a form that would fail.
// Leaving out `allow` just means "must be logged in".
export function RequirePermission({ allow, children }: RequirePermissionProps) {

	const { user, isLoading } = useAuth();
	const location = useLocation();
	const params = useParams();

	if (isLoading) return <p className="text-purple-300">Checking access...</p>;

	if (!user) {
		const next = encodeURIComponent(location.pathname + location.search);
		return <Navigate to={`/login?next=${next}`} replace />;
	}

	if (allow && !allow(user, params)) {
		return (
			<section className="mx-auto max-w-xl py-16 text-center">
				<h1 className="text-2xl font-bold text-white">You don't have access to this</h1>
				<p className="mt-2 text-slate-400">Your role ({user.roles.join(", ") || "none"}) can't open this page.</p>
				<Link to="/dashboard" className="ghost-btn mt-6 inline-block">Back to the dashboard</Link>
			</section>
		);
	}

	return <>{children}</>;
}

export default RequirePermission;
