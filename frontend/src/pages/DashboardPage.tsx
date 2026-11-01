import { useMemo, type ReactNode } from "react";
import { Link } from "react-router";
import { getDashboard } from "../api/dashboardApi";
import { getEvents } from "../api/eventsApi";
import { getSessions } from "../api/sessionsApi";
import MatchCard from "../components/ui/MatchCard";
import MatchRow from "../components/ui/MatchRow";
import PageHeader from "../components/ui/PageHeader";
import StatusMessage from "../components/ui/StatusMessage";
import StatusPill from "../components/ui/StatusPill";
import { convertDate } from "../helper/helperFunctions";
import { useAsyncData } from "../hooks/useAsyncData";
import type { DashboardSummary } from "../types/dashboard";
import type { EventSummary } from "../types/events";
import type { Crumb } from "../types/navigation";
import type { EventMatch } from "../types/sessions";

const LIST_LIMIT = 5;
const TRAIL: Crumb[] = [{ label: "Dashboard", to: "/dashboard" }];

const QUICK_ACTIONS = [
	{ label: "New Event", to: "/events/new" },
	{ label: "New Match", to: "/sessions/new" },
	{ label: "New Team", to: "/teams/new" },
	{ label: "New Member", to: "/members/new" },
];

type DashboardData = {
	summary: DashboardSummary,
	matches: EventMatch[],
	events: EventSummary[]
};

type PanelProps = {
	title: string,
	link?: { label: string, to: string },
	children: ReactNode
};

const startTime = (value: string) => new Date(value).getTime();

function Panel({ title, link, children }: PanelProps) {

	return (
		<section className="stat-card">
			<div className="mb-3 flex items-center justify-between">
				<h2 className="text-lg font-semibold text-white">{title}</h2>
				{link && <Link to={link.to} className="text-sm text-purple-300 hover:text-purple-200">{link.label} →</Link>}
			</div>
			{children}
		</section>
	);
}

function MatchList({ matches, emptyText }: { matches: EventMatch[], emptyText: string }) {

	if (matches.length === 0) return <p className="text-slate-500">{emptyText}</p>;

	return (
		<div className="-mx-3 divide-y divide-slate-800">
			{matches.map(match => <MatchRow key={match.session_id} match={match} />)}
		</div>
	);
}

function DashboardView({ summary, matches, events }: DashboardData) {

	// One pass splits matches by status; only the small buckets get sorted
	const { live, upNext, recent } = useMemo(() => {
		const live: EventMatch[] = [];
		const upcoming: EventMatch[] = [];
		const completed: EventMatch[] = [];

		for (const match of matches) {
			if (match.status === "In-Progress") live.push(match);
			else if (match.status === "Upcoming") upcoming.push(match);
			else if (match.status === "Completed") completed.push(match);
		}

		return {
			live,
			upNext: upcoming.sort((a, b) => startTime(a.scheduled_start) - startTime(b.scheduled_start)).slice(0, LIST_LIMIT),
			recent: completed.sort((a, b) => startTime(b.scheduled_start) - startTime(a.scheduled_start)).slice(0, LIST_LIMIT),
		};
	}, [matches]);

	// A running event comes first, otherwise the soonest upcoming one
	const nextEvent = useMemo(() => {
		const active = events.filter(event => event.status === "In-Progress" || event.status === "Upcoming");
		return active.sort((a, b) =>
			Number(b.status === "In-Progress") - Number(a.status === "In-Progress") || startTime(a.start_on) - startTime(b.start_on)
		)[0] ?? null;
	}, [events]);

	const stats = [
		{ label: "Events", value: summary.total_events, detail: `${summary.total_upcoming_events} upcoming` },
		{ label: "Matches", value: summary.total_sessions, detail: `${summary.total_completed_sessions} completed` },
		{ label: "Upcoming Matches", value: summary.total_upcoming_sessions, detail: `${live.length} live now` },
		{ label: "Teams", value: summary.total_teams, detail: `${summary.total_active_managers} active managers` },
		{ label: "Members", value: summary.total_members, detail: `${summary.total_active_members} active` },
	];

	return (
		<section className="mx-auto max-w-7xl space-y-6">
			<PageHeader title="Dashboard" description="What's happening across your tournaments right now." />

			{/* Compact stats */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
				{stats.map(stat => (
					<div key={stat.label} className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
						<p className="text-xs font-medium uppercase tracking-wider text-slate-500">{stat.label}</p>
						<p className="mt-1 text-2xl font-bold tabular-nums text-white">{stat.value}</p>
						<p className="text-xs text-slate-400">{stat.detail}</p>
					</div>
				))}
			</div>

			{/* Quick actions */}
			<div className="flex flex-wrap gap-3">
				{QUICK_ACTIONS.map(action => (
					<Link key={action.to} to={action.to} className="ghost-btn text-sm">+ {action.label}</Link>
				))}
			</div>

			{/* Live now - only shown while something is being played */}
			{live.length > 0 && (
				<section>
					<h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
						<span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
						Live Now
					</h2>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
						{live.map(match => <MatchCard key={match.session_id} match={match} trail={TRAIL} showEvent />)}
					</div>
				</section>
			)}

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

				<Panel title="Up Next" link={{ label: "All matches", to: "/sessions" }}>
					<MatchList matches={upNext} emptyText="No upcoming matches scheduled." />
				</Panel>

				<Panel title="Recent Results" link={{ label: "All matches", to: "/sessions" }}>
					<MatchList matches={recent} emptyText="No completed matches yet." />
				</Panel>

				<Panel title={nextEvent?.status === "In-Progress" ? "Current Event" : "Next Event"} link={{ label: "All events", to: "/events" }}>
					{nextEvent ? (
						<Link
							to={`/events/${nextEvent.event_id}`}
							className="block rounded-lg border border-purple-900/50 bg-gradient-to-br from-slate-900 to-purple-950 p-4 transition hover:border-purple-700"
						>
							<div className="flex items-start justify-between gap-3">
								<p className="text-lg font-semibold text-white">{nextEvent.event_name}</p>
								<StatusPill status={nextEvent.status} />
							</div>
							<p className="mt-1 text-sm text-slate-400">{nextEvent.location}</p>
							<p className="mt-3 text-sm text-slate-300">{convertDate(nextEvent.start_on)} → {convertDate(nextEvent.end_on)}</p>
						</Link>
					) : (
						<p className="text-slate-500">
							No upcoming events. <Link to="/events/new" className="text-purple-300 hover:text-purple-200">Create one</Link>
						</p>
					)}
				</Panel>
			</div>
		</section>
	);
}

function DashboardPage() {

	// Independent requests, so they run in parallel
	const { data, errorMsg, isLoading } = useAsyncData(
		async () => {
			const [summary, matches, events] = await Promise.all([getDashboard(), getSessions(), getEvents()]);
			return { summary, matches, events };
		},
		"Failed to load dashboard data",
		"dashboard"
	);

	if (isLoading || errorMsg || !data) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg} loadingText="Loading dashboard..." />;
	}

	return <DashboardView {...data} />;
}

export default DashboardPage;
