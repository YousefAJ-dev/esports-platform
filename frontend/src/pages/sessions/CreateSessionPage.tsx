import { useState } from "react";
import type { CreateSessionPayload } from "../../types/sessions";
import { useNavigate, useSearchParams } from "react-router";
import { getTimeRangeError, inputChangeHandler } from "../../helper/helperFunctions";
import FormError from "../../components/ui/FormError";
import { createSession } from "../../api/sessionsApi";
import { getTeams } from "../../api/teamsApi";
import { getEvents } from "../../api/eventsApi";
import { useAsyncData } from "../../hooks/useAsyncData";
import MatchTeamPicker, { type TeamSlots } from "../../components/ui/MatchTeamPicker";
import CancelButton from "../../components/ui/CancelButton";

export function CreateSessionPage() {

	const navigate = useNavigate();

	// "Add Match" on an event's page passes ?event_id= so the event is prefilled
	const [searchParams] = useSearchParams();
	const eventIdParam = searchParams.get("event_id");
	const timeZones = Intl.supportedValuesOf("timeZone");
	const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	const matchOptions = [
		'Qualifier',
		'Group Stage',
		'Round of 16',
		'Round of 8',
		'Quarter-Finals',
		'Semi-Final',
		'Third Place Match',
		'Final',
		'Exhibition'
	];

	// Teams and events fill the dropdowns, so load them together
	const { data: options, errorMsg: optionsError } = useAsyncData(
		async () => {
			const [teams, events] = await Promise.all([getTeams(), getEvents()]);
			return { teams, events };
		},
		"Error fetching teams and events",
		"create-match-options"
	);

	// team_ids is filled from these slots on submit
	const [teamSlots, setTeamSlots] = useState<TeamSlots>(["", ""]);

	const [formData, setFormData] = useState<Omit<CreateSessionPayload, "team_ids">>(
		{
			event_id: eventIdParam ? Number(eventIdParam) : null,
			timezone: browserTimeZone,
			status: "Upcoming",
			scheduled_start: "",
			scheduled_end: "",
			actual_start: "",
			actual_end: "",
			session_type: "",
		}
	);

	const [submitError, setSubmitError] = useState<string | null>(null);

	// Checked on every render so the message shows up as soon as the times are wrong
	const timeError =
		getTimeRangeError(formData.scheduled_start, formData.scheduled_end, "the scheduled start", "Scheduled end")
		?? getTimeRangeError(formData.actual_start, formData.actual_end, "the actual start", "Actual end");

	// Picking an event also switches the timezone to the event's, since matches usually share it
	const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const event = options?.events.find(item => String(item.event_id) === e.target.value);
		setFormData(current => ({
			...current,
			event_id: e.target.value ? Number(e.target.value) : null,
			timezone: event?.timezone ?? current.timezone,
		}));
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
		inputChangeHandler(e, setFormData);
	}

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (timeError) return;

		try {
			const session = await createSession({ ...formData, team_ids: teamSlots.map(Number) });
			navigate(`/sessions/${session.session_id}`)
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : "Error creating match");
		}
	}


	return (
		<div>
			<section className="mx-auto max-w-6xl space-y-8">

				{/* SECTION HEADER */}
				<div className="header-box">
					<h1 className="header-text">Create Match</h1>
				</div>

				{/* Event Form*/}
				<form
					onSubmit={handleSubmit}
					className="stat-card"
				>
					<div className="form-grid">

						{/* Event - finished events are hidden unless it's the one passed in the URL */}
						<label htmlFor="event_id" className="text-lg mb-2">
							Event:
						</label>
						<select
							id="event_id"
							name="event_id"
							value={formData.event_id ?? ""}
							onChange={handleEventChange}
							required
							className="purple-input-box"
						>
							<option value="">Select an Event</option>
							{(options?.events ?? [])
								.filter(event => (event.status !== "Completed" && event.status !== "Cancelled") || event.event_id === formData.event_id)
								.map(event => (
									<option key={event.event_id} value={event.event_id}>{event.event_name}</option>
								))}
						</select>

						{/* Match Type */}
						<label htmlFor="session_type" className="text-lg mb-2">
							Match Type:
						</label>
						<select
							id="session_type"
							name="session_type"
							value={formData.session_type}
							onChange={handleInputChange}
							className="purple-input-box"
						>
							<option value="">Select an Option</option>
							{matchOptions.map((type) => (
								<option key={type} id={type} value={type}>{type}</option>
							))}
						</select>

						{/* Teams - a match is always between two teams */}
						<MatchTeamPicker teams={options?.teams ?? []} value={teamSlots} onChange={setTeamSlots} />

						{/* Scheduled Start */}
						<label htmlFor="scheduled_start" className="text-lg mb-2">
							Scheduled Start:
						</label>
						<div className="flex">
							<input
								id="scheduled_start"
								type="datetime-local"
								name="scheduled_start"
								value={formData.scheduled_start}
								onChange={handleInputChange}
								required
								className="purple-input-box flex-1"
							/>
						</div>

						{/* Scheduled End */}
						<label htmlFor="scheduled_end" className="text-lg mb-2">
							Scheduled End:
						</label>
						<div className="flex">
							<input
								id="scheduled_end"
								type="datetime-local"
								name="scheduled_end"
								value={formData.scheduled_end}
								onChange={handleInputChange}
								required
								className="purple-input-box flex-1"
							/>
						</div>

						{/* Actual Start */}
						<label htmlFor="actual_start" className="text-lg mb-2">
							Actual Start:
						</label>
						<div className="flex">
							<input
								id="actual_start"
								type="datetime-local"
								name="actual_start"
								value={formData.actual_start}
								onChange={handleInputChange}
								className="purple-input-box flex-1"
							/>
						</div>

						{/* Actual End */}
						<label htmlFor="actual_end" className="text-lg mb-2">
							Actual End:
						</label>
						<div className="flex">
							<input
								id="actual_end"
								type="datetime-local"
								name="actual_end"
								value={formData.actual_end}
								onChange={handleInputChange}
								className="purple-input-box flex-1"
							/>
						</div>

						{/* timezone */}
						<label htmlFor="timezone" className="text-lg mb-2">Timezone:</label>
						<select
							name="timezone"
							id="timezone"
							value={formData.timezone}
							className="purple-input-box"
							required
							onChange={handleInputChange}
						>
							<option value="">Select Timezone</option>
							{timeZones.map(timezone => (
								<option key={timezone} value={timezone}>
									{timezone}
								</option>
							))}
						</select>

						{/* Status */}
						<label htmlFor="status" className="text-lg mb-2">
							Status:
						</label>
						<select
							id="status"
							className="purple-input-box"
							name="status"
							value={formData.status}
							required
							onChange={handleInputChange}
						>
							<option value="">Select Status...</option>
							<option value="Upcoming">Upcoming</option>
							<option value="In-Progress">In-Progress</option>
							<option value="Completed">Completed</option>
							<option value="Cancelled">Cancelled</option>
						</select>

					</div>

					<FormError message={timeError ?? optionsError ?? submitError} />

					<div className="mt-10 mb-5 flex items-center gap-4">
						<button type="submit" disabled={timeError !== null} className="green-btn green-btn-clickable disabled:cursor-not-allowed disabled:opacity-50">Save Changes</button>
						<CancelButton to={eventIdParam ? `/events/${eventIdParam}` : "/sessions"} />
					</div>
				</form>
			</section>
		</div>
	);
}

export default CreateSessionPage;