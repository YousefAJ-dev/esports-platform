import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getSessionByID, getSessionOverview } from "../../api/sessionsApi";
import type { SessionOverview, SessionSummary } from "../../types/sessions";
import { convertDate } from "../../helper/helperFunctions";

export function SessionDetailsPage() {

	const { id } = useParams();

	const [session, setSession] = useState<SessionSummary | null>(null);
	const [sessionOverview, setSessionOverview] = useState<SessionOverview | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {

		if (!id) {
			setErrorMsg(`Could not find ID: ${id}`);
			setIsLoading(false);
			return;
		}

		async function loadSessionData() {

			try {

				const sessionData = await getSessionByID(id);
				const overviewData = await getSessionOverview(id);
				setSession(sessionData);
				setSessionOverview(overviewData);
				console.log(sessionData.actual_start);

			} catch {
				setErrorMsg("Error fetching Sessing Data");
			} finally {
				setIsLoading(false);
			}
		}
		loadSessionData();
	}, [id]);

	if (isLoading) {
		return (
			<section className="min-h-screen bg-slate-950 p-6 text-slate-100">
				<p className="text-purple-300">Loading sessions...</p>
			</section>
		);
	}

	if (errorMsg) {
		return (
			<section className="min-h-screen bg-slate-950 p-6 text-slate-100">
				<div className="stat-card">
					{errorMsg}
				</div>
			</section>
		);
	}

	if (!session) {
		return <p>Session not found</p>;
	}

	return (
		<div className="min-h-screen bg-slate-950 p-6 text-slate-100">
			<div className="mx-auto max-w-6xl space-y-8">

				{/* Header */}
				<div className="header-box">
					<p className="text-sm font-medium text-purple-300">
						Session #{session.session_id}
					</p>
					<h1 className="header-text">{session.session_type}</h1>
				</div>

				<div className="flex justify-end">
					<Link
						to={`/sessions/${id}/edit`}
						className="green-btn green-btn-clickable"
					>
						Edit
					</Link>
				</div>

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

						<div className="stat-card">
							<p className="light-text">Event Number</p>
							<p className="value-text">
								{session.event_id}
							</p>
						</div>

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
				{/* Session Overview */}
				{sessionOverview && (
					<section>
						<h2 className="m-6 text-2xl font-semibold text-white">
							Session Overview
						</h2>
						<main className="flex flex-col gap-6">
							{/*Event Name*/}
							<div className="stat-card-purple">
								<p className="light-purple-text">
									Event Name:
								</p>
								<p className="lighter-purple-text">
									{sessionOverview.event_name}
								</p>
							</div>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">

								{/*Team 1*/}
								<div className="stat-card">
									<p className="light-text">
										Team 1
									</p>
									<p className="value-text">
										{sessionOverview.team_1}
									</p>
								</div>

								{/*Manager1*/}
								<div className="stat-card">
									<p className="light-text">
										Team 1 Manager
									</p>
									<p className="value-text">
										{sessionOverview.manager_1}
									</p>
								</div>

								{/*playerCount1*/}
								<div className="stat-card">
									<p className="light-text">
										Team 1 Player Count
									</p>
									<p className="value-text">
										{sessionOverview.player_count_1}
									</p>
								</div>

								{/*Team 2*/}
								<div className="stat-card">
									<p className="light-text">
										Team 2
									</p>
									<p className="value-text">
										{sessionOverview.team_2}
									</p>
								</div>

								{/*Manager 2*/}
								<div className="stat-card">
									<p className="light-text">
										Team 2 Manager
									</p>
									<p className="value-text">
										{sessionOverview.manager_2}
									</p>
								</div>

								{/*playerCount 2*/}
								<div className="stat-card">
									<p className="light-text">
										Team 2 Player Count
									</p>
									<p className="value-text">
										{sessionOverview.player_count_2}
									</p>
								</div>
							</div>
						</main>
					</section>
				)}
			</div>
		</div>
	);

}

export default SessionDetailsPage;