import { Link, useParams } from "react-router";
import { getSessionByID, getSessionOverview, getSessionTeams } from "../../api/sessionsApi";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import StatusMessage from "../../components/ui/StatusMessage";
import { convertDate } from "../../helper/helperFunctions";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useBreadcrumbTrail } from "../../hooks/useBreadcrumbTrail";
import { useAuth } from "../../context/authContext";
import { canManageEvent } from "../../helper/permissions";

type TeamCardShellProps = {
	to: string | null,
	state: unknown,
	className: string,
	children: React.ReactNode
};

// A link when there's somewhere to go, otherwise a plain card with the same look
function TeamCardShell({ to, state, className, children }: TeamCardShellProps) {

	if (!to) return <div className={className.replace("stat-card-clickable", "")}>{children}</div>;

	return <Link to={to} state={state} className={className}>{children}</Link>;
}

export function SessionDetailsPage() {

	const { id } = useParams();
	const { user } = useAuth();

	// The three requests are independent, so run them in parallel
	const { data, errorMsg, isLoading } = useAsyncData(
		async () => {
			const [session, overview, teams] = await Promise.all([
				getSessionByID(id),
				getSessionOverview(id),
				getSessionTeams(id)
			]);
			return { session, overview, teams };
		},
		"Error fetching match data",
		id
	);

	const matchLabel = data ? `${data.session.session_type} #${data.session.session_id}` : `Match #${id}`;

	// Direct visits fall back to Events / <event> / this match
	const { trail, childTrail } = useBreadcrumbTrail(
		data
			? [
				{ label: "Events", to: "/events" },
				{ label: data.overview.event_name, to: `/events/${data.session.event_id}` }
			]
			: [{ label: "Matches", to: "/sessions" }],
		matchLabel
	);

	if (isLoading || errorMsg || !data) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg ?? "Match not found"} loadingText="Loading match..." />;
	}

	const { session, overview, teams } = data;

	return (
		<div>
			<div className="mx-auto max-w-6xl space-y-8">

				<Breadcrumbs trail={trail} current={matchLabel} />

				{/* Header */}
				<div className="header-box">
					<p className="text-sm font-medium text-purple-300">
						Match #{session.session_id}
					</p>
					<h1 className="header-text">{session.session_type}</h1>
				</div>

				{canManageEvent(user, session.event_created_by) && (
					<div className="flex justify-end">
						<Link
							to={`/sessions/${id}/edit`}
							className="green-btn green-btn-clickable"
						>
							Edit
						</Link>
					</div>
				)}

				{/* Session Stats*/}
				<section>
					{/* Session Details*/}
					<h2 className="mb-4 text-2xl font-semibold text-white">
						Session Details
					</h2>
					<div className="grid grid-cols-2 gap-5">

						<div className="stat-card">
							<p className="light-text">Scheduled Start</p>
							<p className="value-text">
								{convertDate(session.scheduled_start)}
							</p>
						</div>

						<div className="stat-card">
							<p className="light-text">Scheduled End</p>
							<p className="value-text">
								{convertDate(session.scheduled_end)}
							</p>
						</div>

						<div className="stat-card">
							<p className="light-text">Actual Start</p>
							<p className="value-text">
								{session.actual_start ? convertDate(session.actual_start) : `N/A`}
							</p>
						</div>

						<div className="stat-card">
							<p className="light-text">Actual End</p>
							<p className="value-text">
								{session.actual_end ? convertDate(session.actual_end) : `N/A`}
							</p>
						</div>

						{/* Back to the event this match belongs to */}
						<Link
							to={`/events/${session.event_id}`}
							className="stat-card stat-card-clickable"
						>
							<p className="light-text">Event</p>
							<p className="value-text">
								{overview.event_name}
							</p>
						</Link>

						<div className="stat-card-purple">
							<p className="light-purple-text">
								Status
							</p>
							<p className="lighter-purple-text">
								{session.status}
							</p>
						</div>
					</div>
				</section>

				{/* Teams in this Match */}
				<section>
					<h2 className="mb-4 text-2xl font-semibold text-white">
						Teams in this Match
					</h2>

					{teams.length === 0 ? (
						<div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
							No teams assigned to this match yet.
						</div>
					) : (
						// Team pages need a login, so visitors get the same cards without links
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{teams.map(team => (
								<TeamCardShell
									key={team.team_id}
									to={user ? `/teams/${team.team_id}` : null}
									state={{ trail: childTrail }}
									className={`${team.is_winner ? "stat-card-purple" : "stat-card"} stat-card-clickable block`}
								>
									<div className="stat-card-header">
										<h3 className="text-xl font-semibold text-white">{team.team_name}</h3>
										{team.is_winner && <span className="status-pill">Winner</span>}
									</div>

									<div className="stat-body">
										<div className="stat-field-grid">
											<div>
												<p className="text-slate-500">Score</p>
												<p className="stat-field-value">{team.score ?? "–"}</p>
											</div>
											<div>
												<p className="text-slate-500">Players</p>
												<p className="stat-field-value">{team.player_count}</p>
											</div>
										</div>
										<div>
											<p className="text-slate-500">Manager</p>
											<p className="stat-field-value">{team.manager_name || "N/A"}</p>
										</div>
									</div>

									<p className="stat-link-text">View team →</p>
								</TeamCardShell>
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	);

}

export default SessionDetailsPage;
