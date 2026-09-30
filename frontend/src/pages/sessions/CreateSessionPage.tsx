import { useState } from "react";
import type { CreateSessionPayload } from "../../types/sessions";
import { useNavigate } from "react-router";
import { inputChangeHandler } from "../../helper/helperFunctions";
import { createSession } from "../../api/sessionsApi";

export function CreateSessionPage() {

	const navigate = useNavigate();
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

	const [formData, setFormData] = useState<CreateSessionPayload>(
		{
			event_id: null,
			timezone: browserTimeZone,
			status: "Upcoming",
			scheduled_start: "",
			scheduled_end: "",
			actual_start: "",
			actual_end: "",
			session_type: "",
		}
	);

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
		inputChangeHandler(e, setFormData);
	}

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			const session = await createSession(formData);
			navigate(`/sessions/${session.session_id}`)
		} catch (error) {

		}
	}


	return (
		<div className="min-h-screen p-6">
			<section className="mx-auto max-w-6xl space-y-8">

				{/* SECTION HEADER */}
				<div className="header-box">
					<h1>Create Match</h1>
				</div>

				{/* Event Form*/}
				<form
					onSubmit={handleSubmit}
					className="stat-card"
				>
					<div className="mt-7 grid grid-cols-[160px_1fr] gap-x-4 gap-y-5 items-center">

						{/* Event ID */}
						<label htmlFor="event_id" className="text-lg mb-2">
							Event ID:
						</label>
						<input
							id="event_id"
							type="number"
							min={0}
							name="event_id"
							value={formData.event_id ?? ""}
							onChange={handleInputChange}
							required
							className="purple-input-box"
						/>

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

					<div>
						<button type="submit" className="green-btn green-btn-clickable mt-10 mb-5">Save Changes</button>
					</div>
				</form>
			</section>
		</div>
	);
}

export default CreateSessionPage;