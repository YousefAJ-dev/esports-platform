import { SessionCard } from "../../components/ui/SessionCard"
import { getSessions } from "../../api/sessionsApi";
import { Link } from "react-router";
import StatusMessage from "../../components/ui/StatusMessage";
import { useAsyncData } from "../../hooks/useAsyncData";

function SessionsPage() {

	const { data: sessions, errorMsg, isLoading } = useAsyncData(getSessions, "Failed to load match data", "sessions");

	if (isLoading || errorMsg || !sessions) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg} loadingText="Loading matches..." />;
	}

	const sessionsList = sessions.map( session => (
		<SessionCard
			key={session.session_id}
			session={session}
		/>));

	return(
		<section className="main-content-layout">
			<div className="mx-auto max-w-7xl space-y-8">

				{/* Header */}
				<div className="header-box">
					<p className="text-sm font-medium text-purple-300">
						Matches
					</p>
					<h1 className="header-text">
						Tournament Matches
					</h1>
					<p className="mt-2 text-slate-400">
						An overview of the matches played across all events.
					</p>
				</div>


				{/* Summary Bar */}
				<div className="stat-card">
					<p className="stat-title">
						Total Matches
					</p>
					<p className="mt-1 text-3xl font-bold text-white">
						{sessions.length}
					</p>
				</div>

				<div className="flex justify-end">
					<Link 
					to={ `/sessions/new` }
					className="green-btn green-btn-clickable"
					>
						Add New
					</Link>
				</div>

				{/* Match Details */}
				{sessions.length === 0 ? (
						<div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
							No matches found.
						</div>
					) : (
				<div 
					className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
				>
					{sessionsList}
				</div>
				)}
			</div>
		</section>
	);
}

export default SessionsPage;