import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import type { EventOverview, EventSummary } from "../../types/events";
import { getEventByID, getEventOverview } from "../../api/eventsApi";
import { convertDate } from "../../helper/helperFunctions";

export function EventDetailPage() {

	const { id } = useParams();

	const [event, setEvent] = useState<EventSummary | null>(null);
	const [eventOverview, setEventOverview] = useState<EventOverview | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		if (!id) {
			setErrorMsg(`Could not find Event ID: ${id}`);
			setIsLoading(false);
			return;
		}

		async function loadEventData() {
			
			try {
				const data1 = await getEventByID(id);
				setEvent(data1);

				const data2 = await getEventOverview(id);
				setEventOverview(data2);

			} catch {
				setErrorMsg("Failed to fetch Event Data");
			} finally {
				setIsLoading(false);
			}
		}

		loadEventData();
	}, [id]);

	if (isLoading) {
		return (
			<section className="min-h-screen bg-slate-950 p-6 text-slate-100">
				<p className="text-purple-300">Loading events...</p>
			</section>
		);
	}

	if (errorMsg) {
		return <p>{errorMsg}</p>;
	}

	if (!event) {
		return <p>No event found.</p>;
	}

	return (
	<div className="min-h-screen bg-slate-950 p-6 text-slate-100">
		<div className="mx-auto max-w-6xl space-y-8">
			
			{/* Header */}
			<div className="rounded-2xl border border-purple-900/50 bg-gradient-to-br from-slate-900 to-purple-950 p-6 shadow-lg shadow-purple-950/30">
				<p className="text-sm font-medium text-purple-300">
					Event ID: {event.event_id}
				</p>

				<h1 className="mt-2 text-4xl font-bold text-white">
					{event.event_name}
				</h1>

				<p className="mt-2 text-slate-400">
					{event.description ?? "An Esports Tournament"}
				</p>
			</div>

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
			{eventOverview && (
				<section>
					<h2 className="mb-4 text-2xl font-semibold text-white">
						Overview
					</h2>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
						<div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
							<p className="text-sm text-slate-400">Matches</p>
							<p className="mt-2 text-3xl font-bold text-white">
								{eventOverview.session_count}
							</p>
						</div>

						<div className="stat-card">
							<p className="text-sm text-slate-400">Completed</p>
							<p className="mt-2 text-3xl font-bold text-white">
								{eventOverview.completed_session_count}
							</p>
						</div>

						<div className="stat-card">
							<p className="text-sm text-purple-300">Ongoing</p>
							<p className="mt-2 text-3xl font-bold text-purple-100">
								{eventOverview.ongoing_session_count}
							</p>
						</div>

						<div className="stat-card">
							<p className="text-sm text-slate-400">Upcoming</p>
							<p className="mt-2 text-3xl font-bold text-white">
								{eventOverview.upcoming_session_count}
							</p>
						</div>

						<div className="stat-card">
							<p className="text-sm text-slate-400">Teams</p>
							<p className="mt-2 text-3xl font-bold text-white">
								{eventOverview.team_count}
							</p>
						</div>
					</div>
				</section>
			)}
		</div>
	</div>
);
}

export default EventDetailPage;