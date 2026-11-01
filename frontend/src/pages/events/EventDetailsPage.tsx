import { useMemo } from "react";
import { Link, useParams } from "react-router";
import { getEventByID, getEventMatches, getEventOverview } from "../../api/eventsApi";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import EventBracket from "../../components/ui/EventBracket";
import EventTeamsSection from "../../components/ui/EventTeamsSection";
import StandingsTable from "../../components/ui/StandingsTable";
import { getStandings } from "../../api/standingsApi";
import MatchCard from "../../components/ui/MatchCard";
import StatusMessage from "../../components/ui/StatusMessage";
import { convertDate } from "../../helper/helperFunctions";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useBreadcrumbTrail } from "../../hooks/useBreadcrumbTrail";
import { useAuth } from "../../context/authContext";
import { canManageEvent } from "../../helper/permissions";

export function EventDetailPage() {

	const { id } = useParams();
	const { user } = useAuth();

	// Event, overview and matches don't depend on each other, so load them in parallel
	const { data, errorMsg, isLoading } = useAsyncData(
		async () => {
			const [event, overview, matches, standings] = await Promise.all([
				getEventByID(id),
				getEventOverview(id),
				getEventMatches(id),
				getStandings(id)
			]);
			return { event, overview, matches, standings };
		},
		"Failed to fetch Event Data",
		id
	);

	const { trail, childTrail } = useBreadcrumbTrail(
		[{ label: "Events", to: "/events" }],
		data?.event.event_name ?? `Event #${id}`
	);

	// Chronological copy for the match list; the bracket keeps the round order from the API
	const schedule = useMemo(
		() => [...(data?.matches ?? [])].sort(
			(a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime()
		),
		[data]
	);

	if (isLoading || errorMsg || !data) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg ?? "No event found."} loadingText="Loading event..." />;
	}

	const { event, overview, matches, standings } = data;

	// Only the Organizer who planned this event (or an Admin) can change it
	const canManage = canManageEvent(user, event.created_by);

	return (
	<div>
		<div className="mx-auto max-w-6xl space-y-8">

			<Breadcrumbs trail={trail} current={event.event_name} />

			{/* Header */}
			<div className="header-box">
				<p className="text-sm font-medium text-purple-300">
					Event ID: {event.event_id}
				</p>

				<h1 className="header-text">
					{event.event_name}
				</h1>

				<p className="mt-2 text-slate-400">
					{event.description ?? "An Esports Tournament"}
				</p>
			</div>

			{canManage && (
				<div className="flex justify-end">
					<Link to={`/events/${event.event_id}/edit`} className="green-btn green-btn-clickable">Edit Event</Link>
				</div>
			)}

			{/* Event Details */}
			<section>
				<div className="flex justify-end">
					<Link
					to={ `/events/${event.event_id}/edit` }
					className="green-btn green-btn-clickable">
						Edit
					</Link>
				</div>

				<h2 className="mb-4 text-2xl font-semibold text-white">
					Event Details
				</h2>

				<div className="admin-details-page-grid">
					<div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
						<p className="text-sm text-slate-400">Start Date</p>
						<p className="mt-1 text-lg font-semibold text-white">
							{convertDate(event.start_on)}
						</p>
					</div>

					<div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
						<p className="text-sm text-slate-400">End Date</p>
						<p className="mt-1 text-lg font-semibold text-white">
							{convertDate(event.end_on)}
						</p>
					</div>

					<div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
						<p className="text-sm text-slate-400">Location</p>
						<p className="mt-1 text-lg font-semibold text-white">
							{event.location ?? "N/A"}
						</p>
					</div>

					<div className="rounded-xl border border-purple-800/60 bg-purple-950/40 p-5">
						<p className="text-sm text-purple-300">Status</p>
						<p className="mt-1 text-lg font-semibold text-purple-100">
							{event.status}
						</p>
					</div>
				</div>
			</section>

			{/* Overview */}
			<section>
				<h2 className="mb-4 text-2xl font-semibold text-white">
					Overview
				</h2>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
					<div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
						<p className="text-sm text-slate-400">Matches</p>
						<p className="mt-2 text-3xl font-bold text-white">
							{overview.session_count}
						</p>
					</div>

					<div className="stat-card">
						<p className="text-sm text-slate-400">Completed</p>
						<p className="mt-2 text-3xl font-bold text-white">
							{overview.completed_session_count}
						</p>
					</div>

					<div className="stat-card">
						<p className="text-sm text-purple-300">Ongoing</p>
						<p className="mt-2 text-3xl font-bold text-purple-100">
							{overview.ongoing_session_count}
						</p>
					</div>

					<div className="stat-card">
						<p className="text-sm text-slate-400">Upcoming</p>
						<p className="mt-2 text-3xl font-bold text-white">
							{overview.upcoming_session_count}
						</p>
					</div>

					<div className="stat-card">
						<p className="text-sm text-slate-400">Teams</p>
						<p className="mt-2 text-3xl font-bold text-white">
							{overview.team_count}
						</p>
					</div>
				</div>
			</section>

			{/* Registered Teams - matches can only use these. Team details need a login, so visitors skip this */}
			{user && (
				<section>
					<h2 className="mb-4 text-2xl font-semibold text-white">Registered Teams</h2>
					<EventTeamsSection eventId={id} eventStatus={event.status} trail={childTrail} canManage={canManage} />
				</section>
			)}

			{/* Bracket */}
			<section>
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-2xl font-semibold text-white">
						Bracket
					</h2>
					{/* Prefills the event on the create form */}
					{canManage && (
						<Link
							to={`/sessions/new?event_id=${event.event_id}`}
							className="green-btn green-btn-clickable"
						>
							Add Match
						</Link>
					)}
				</div>

				<EventBracket matches={matches} trail={childTrail} />
			</section>

			{/* Standings - this event's registered teams only */}
			<section>
				<h2 className="mb-4 text-2xl font-semibold text-white">Standings</h2>
				<StandingsTable standings={standings} trail={childTrail} />
			</section>

			{/* Match Schedule */}
			{schedule.length > 0 && (
				<section>
					<h2 className="mb-4 text-2xl font-semibold text-white">
						Matches
					</h2>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
						{schedule.map(match => (
							<MatchCard key={match.session_id} match={match} trail={childTrail} showRound />
						))}
					</div>
				</section>
			)}
		</div>
	</div>
);
}

export default EventDetailPage;
