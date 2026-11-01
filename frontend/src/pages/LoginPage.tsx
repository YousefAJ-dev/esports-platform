import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import FormError from "../components/ui/FormError";
import { useAuth } from "../context/authContext";

// Only allow returning to a path inside this app, so ?next= can't send someone to another site
function safeNext(next: string | null) {
	return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

function LoginPage() {

	const { user, login } = useAuth();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const next = safeNext(searchParams.get("next"));

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Already logged in (e.g. opened /login again): go where they were headed
	if (user) return <Navigate to={next} replace />;

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault(); // Do not refresh browser on submit

		setError(null);
		setIsSubmitting(true);

		try {
			await login({ username, password });
			navigate(next, { replace: true });
		} catch (loginError) {
			setError(loginError instanceof Error ? loginError.message : "Login failed");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
			<div className="w-full max-w-sm">

				<div className="mb-6 flex items-center justify-center gap-3">
					<span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-lg font-bold text-white">A</span>
					<div>
						<p className="text-lg font-semibold text-white">Arena Admin</p>
						<p className="text-xs text-slate-500">Staff sign in</p>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="stat-card space-y-4 p-6">
					<div className="space-y-1">
						<label htmlFor="username" className="text-sm text-slate-300">Username</label>
						<input
							id="username"
							value={username}
							onChange={e => setUsername(e.target.value)}
							autoComplete="username"
							autoFocus
							required
							className="purple-input-box"
						/>
					</div>

					<div className="space-y-1">
						<label htmlFor="password" className="text-sm text-slate-300">Password</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							autoComplete="current-password"
							required
							className="purple-input-box"
						/>
					</div>

					<FormError message={error} />

					<button
						type="submit"
						disabled={isSubmitting}
						className="green-btn green-btn-clickable w-full py-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isSubmitting ? "Signing in..." : "Sign in"}
					</button>
				</form>

				<p className="mt-4 text-center text-sm text-slate-500">
					Just here to watch? <Link to="/dashboard" className="text-purple-300 hover:text-purple-200">View the tournaments</Link>
				</p>
			</div>
		</div>
	);
}

export default LoginPage;
