import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getSessionByID } from "../../api/sessionsApi";
import type { SessionSummary } from "../../types/sessions";
import { convertDate } from "../../helper/helperFunctions";

export function SessionDetailsPage() {
	
	const { id } = useParams();

	const [ session, setSession] = useState<SessionSummary | null>(null);
	const [ errorMsg, setErrorMsg ] = useState<string | null>(null);
	const [ isLoading, setIsLoading ] = useState<boolean>(true);

	useEffect( () => {
		async function loadSessionData() {
			
			try {
				
				const data = await getSessionByID(id);
				setSession(data);

			} catch {
				setErrorMsg("Error fetching Sessing Data");
			} finally {
				setIsLoading(false);
			}
		}
		loadSessionData();
	}, [id]);

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

	if (!session){
		return; 
	}

	return(
		<div className="min-h-screen bg-slate-950 p-6 text-slate-100">
			<div className="mx-auto max-w-6xl space-y-8">
				
				{/* Header */}
				<div className="header-box">
					<p className="text-sm font-medium text-purple-300">
						Session #{session.session_id}
					</p>
					<h1 className="header-text">{session.session_type}</h1>
				</div>

				{/* Session Summary */}
				<section>
					<h2 className="mb-4 text-2xl font-semibold text-white">
						Session Details
					</h2>
					<div className="grid grid-cols-2 gap-5">
						<div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
							<p className="text-sm text-slate-400">Start Date</p>
							<p className="mt-1 text-lg font-semibold text-white">
								{convertDate(session.scheduled_start)}
							</p>
						</div>
	
						<div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
							<p className="text-sm text-slate-400">End Date</p>
							<p className="mt-1 text-lg font-semibold text-white">
								{convertDate(session.scheduled_end)}
							</p>
						</div>
					</div>
					<div className="rounded-xl border border-purple-800/60 bg-purple-950/40 p-5 mt-5">
						<p className="text-sm text-purple-300">Status</p>
						<p className="mt-1 text-lg font-semibold text-purple-100">
							{session.status}
						</p>
					</div>
				</section>

			</div>
		</div>
	);

}

export default SessionDetailsPage;