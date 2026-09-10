import { useEffect, useState } from "react";
import type { SessionSummary } from "../../types/sessions";
import { SessionCard } from "../../components/ui/SessionCard"
import { getSessions } from "../../api/sessionsApi";
import { Link, useParams } from "react-router";

function SessionsPage (){

	const [ sessions, setSessions ] = useState<SessionSummary[]>([]);
	//const [ sessionOverview, setSessionOverview ] = useState<>();

	const [ errorMsg, setErrorMsg ] = useState<null | string>(null);
	const [ isLoading, setIsLoading ] = useState(true);

	useEffect( () => {
		async function loadSessionData() {
			try {
				const data = await getSessions();
				setSessions(data);
			} catch {
				setErrorMsg("Failed to Fetch Session Data")
			} finally {
				setIsLoading(false);
			}
		}

		loadSessionData();

	}, []);

	if (isLoading){
		return (
			<section className="min-h-screen bg-slate-950 p-6 text-slate-100">
				<p className="text-purple-300">Loading sessions...</p>
			</section>
		);
	}

	if (errorMsg){
		return (
			<section className="min-h-screen bg-slate-950 p-6 text-slate-100">
				<div className="stat-card">
					{errorMsg}
				</div>
			</section>
		);
	}

	if (!sessions){
		return; 
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
					<h1 className="mt-2 text-4xl font-bold text-white">
						Tournament Matches
					</h1>
					<p className="mt-2 text-slate-400">
						An overview of sessions that belong to this platform
					</p>
				</div>
				{/* Summary Bar */}
				<div className="stat-card">
					<p className="stat-title">
						Total Matches:
					</p>
					<p className="mt-1 text-3xl font-bold text-white">
						{sessions.length}
					</p>
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