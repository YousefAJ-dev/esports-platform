import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { convertDateToInput, getTimeRangeError, inputChangeHandler } from "../../helper/helperFunctions";
import FormError from "../../components/ui/FormError";
import type { SessionSummary } from "../../types/sessions";
import { getSessionByID, updateSessionByID } from "../../api/sessionsApi";
import MatchResultsForm from "../../components/ui/MatchResultsForm";
import MatchTeamsForm from "../../components/ui/MatchTeamsForm";
import StatusMessage from "../../components/ui/StatusMessage";
import CancelButton from "../../components/ui/CancelButton";

export function EditSessionDetails() {

	const [formData, setFormData] = useState<SessionSummary | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [submitError, setSubmitError] = useState<string | null>(null);
	// Saved status (not the live dropdown) decides whether teams are locked
	const [savedStatus, setSavedStatus] = useState<string>("");
	// Bumped when teams change so the results section reloads with the new teams
	const [teamsVersion, setTeamsVersion] = useState<number>(0);

	const { id } = useParams();
	const navigate = useNavigate();
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


	const timeZones = Intl.supportedValuesOf("timeZone");

	useEffect(() => {

		async function loadFormData() {

			if (!id) {
				setErrorMsg("No ID param found");
				return;
			};

			try {

				const data = await getSessionByID(id);
				// Times are shown in the session's own timezone, since that's how the backend reads them back
				setSavedStatus(data.status);
				setFormData({
					...data,
					scheduled_start: convertDateToInput(data.scheduled_start, data.timezone),
					scheduled_end: convertDateToInput(data.scheduled_end, data.timezone),
					actual_start: data.actual_start ? convertDateToInput(data.actual_start, data.timezone) : undefined,
					actual_end: data.actual_end ? convertDateToInput(data.actual_end, data.timezone) : undefined,
				});

			} catch {
				setErrorMsg("Error fetching match data");
			} finally {
				setIsLoading(false);
			}
		}

		loadFormData();

	}, [id]);

	if (isLoading || errorMsg || !formData) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg ?? "Match not found"} loadingText="Loading match..." />;
	}

	// Checked on every render so the message shows up as soon as the times are wrong
	const timeError =
		getTimeRangeError(formData.scheduled_start, formData.scheduled_end, "the scheduled start", "Scheduled end")
		?? getTimeRangeError(formData.actual_start, formData.actual_end, "the actual start", "Actual end");

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		inputChangeHandler(e, setFormData)
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!id || timeError) return;

		try {
			// A cleared actual time comes through as "", which the backend can't cast - send null instead
			await updateSessionByID(id, {
				...formData,
				actual_start: formData.actual_start || null,
				actual_end: formData.actual_end || null,
			});
			navigate(`/sessions/${id}`);
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : "Error updating match");
		}
	}

	return (
		<section className="flex flex-col gap-4" >
			{/* Header */}
			<div className="header-box">
				<h1 className="header-text">Edit Match</h1>
				<p className="stat-id">
					Match #{id}
				</p>
			</div>

			{/* Edit Form */}
			<form 
			onSubmit={handleSubmit}
			className="mt-10 stat-card"
			>

				<div className="form-grid">

					{/* Session Type */}
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

					{/* Scheduled Start */}
					<label htmlFor="scheduled_start" className="text-lg mb-2">
						Scheduled Start:
					</label>
					<input
						id="scheduled_start"
						type="datetime-local"
						name="scheduled_start"
						value={formData.scheduled_start}
						onChange={handleInputChange}
						className="purple-input-box"
					/>

					{/* Scheduled end */}
					<label htmlFor="scheduled_end" className="text-lg mb-2">
						Scheduled End:
					</label>
					<input
						id="scheduled_end"
						type="datetime-local"
						name="scheduled_end"
						value={formData.scheduled_end}
						onChange={handleInputChange}
						className="purple-input-box"
					/>

					{/* Actual Start */}
					<label htmlFor="actual_start" className="text-lg mb-2">
						Actual Start:
					</label>
					<input
						id="actual_start"
						type="datetime-local"
						name="actual_start"
						value={formData.actual_start ?? ""}
						onChange={handleInputChange}
						className="purple-input-box"
					/>

					{/* Actual End */}
					<label htmlFor="actual_end" className="text-lg mb-2">
						Actual End:
					</label>
					<input
						id="actual_end"
						type="datetime-local"
						name="actual_end"
						value={formData.actual_end ?? ""}
						onChange={handleInputChange}
						className="purple-input-box"
					/>

					{/* timezone */}
					<label htmlFor="timezone" className="text-lg mb-2">Timezone:</label>
					<select 
						name="timezone" 
						id="timezone"
						className="purple-input-box"
						value={formData.timezone ?? browserTimeZone}
						required
						onChange={handleInputChange}
					>
						<option value="">Select Timezone</option>
						{timeZones.map( timezone => (
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
					name="status" 
					id="status"
					value={formData.status}
					className="purple-input-box"
					onChange={handleInputChange}
					required
					>
						<option value="">Select an option</option>
						<option value="Upcoming">Upcoming</option>
						<option value="In-Progress">In-Progress</option>
						<option value="Completed">Completed</option>
						<option value="Cancelled">Cancelled</option>
					</select>
				</div>

				<FormError message={timeError ?? submitError} />

				<div className="mt-10 mb-5 flex items-center gap-4">
					<button type="submit" disabled={timeError !== null} className="green-btn green-btn-clickable disabled:cursor-not-allowed disabled:opacity-50">Save Changes</button>
					<CancelButton to={`/sessions/${id}`} />
				</div>
			</form>

			{/* Match Teams */}
			<h2 className="mt-6 text-2xl font-semibold text-white">Teams</h2>
			<MatchTeamsForm sessionId={id} eventId={formData.event_id} status={savedStatus} onSaved={() => setTeamsVersion(v => v + 1)} />

			{/* Match Results */}
			<h2 className="mt-6 text-2xl font-semibold text-white">Results</h2>
			<MatchResultsForm sessionId={id} refreshKey={teamsVersion} />
		</section>
	);

}

export default EditSessionDetails;