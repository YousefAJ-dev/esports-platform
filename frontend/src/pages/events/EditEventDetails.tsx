import { useState } from "react";
import type { EventSummary } from "../../types/events";
import { useNavigate, useParams } from "react-router";
import { getEventByID, updateEventByID } from "../../api/eventsApi";
import { convertDateToInput, getTimeRangeError, inputChangeHandler } from "../../helper/helperFunctions";
import { useAsyncData } from "../../hooks/useAsyncData";
import FormError from "../../components/ui/FormError";
import StatusMessage from "../../components/ui/StatusMessage";
import CancelButton from "../../components/ui/CancelButton";

type EventEditFormProps = {
	id: string | undefined,
	original: EventSummary
};

function EventEditForm({ id, original }: EventEditFormProps) {

	const navigate = useNavigate();
	const timeZones = Intl.supportedValuesOf("timeZone");

	// Both times are converted to input format once, up front. Keeping the raw UTC value
	// for an untouched field is what used to shift the end time on save.
	const [formData, setFormData] = useState<EventSummary>(() => ({
		...original,
		start_on: convertDateToInput(original.start_on, original.timezone),
		end_on: convertDateToInput(original.end_on, original.timezone),
	}));
	const [submitError, setSubmitError] = useState<string | null>(null);

	// Checked on every render so the message shows up as soon as the times are wrong
	const timeError = getTimeRangeError(formData.start_on, formData.end_on, "the start date", "End date");

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
		inputChangeHandler(e, setFormData);
	};

	const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault(); // Do not refresh browser on submit

		if (timeError) return;

		try {
			await updateEventByID(id, formData); // update the data
			navigate(`/events/${id}`); // go back to that event's detail page
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : "Error updating event");
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="mt-10 stat-card"
		>

			<div className="form-grid">

				{/* Event Name */}
				<label htmlFor="event_name" className="text-lg mb-2">
					Event Name:
				</label>
				<input
					id="event_name"
					type="text"
					name="event_name"
					value={formData.event_name}
					onChange={handleInputChange}
					required
					className="purple-input-box"
				/>

				{/* Description */}
				<label htmlFor="description" className="text-lg mb-2">
					Description:
				</label>
				<input
					id="description"
					type="text"
					name="description"
					value={formData.description ?? ""}
					onChange={handleInputChange}
					className="purple-input-box"
				/>

				{/* Location */}
				<label htmlFor="location" className="text-lg mb-2">
					Location:
				</label>
				<input
					id="location"
					type="text"
					name="location"
					value={formData.location}
					onChange={handleInputChange}
					required
					className="purple-input-box"
				/>

				{/* Start Date */}
				<label htmlFor="start_on" className="text-lg mb-2">
					Start Date:
				</label>
				<div className="flex">
					<input
						id="start_on"
						type="datetime-local"
						name="start_on"
						value={formData.start_on}
						onChange={handleInputChange}
						required
						className="purple-input-box flex-1"
					/>
				</div>

				{/* End Date */}
				<label htmlFor="end_on" className="text-lg mb-2">
					End Date:
				</label>
				<div className="flex">
					<input
						id="end_on"
						type="datetime-local"
						name="end_on"
						value={formData.end_on}
						onChange={handleInputChange}
						required
						aria-invalid={timeError !== null}
						className="purple-input-box flex-1"
					/>
				</div>

				{/* timezone - the start/end times above are in this zone */}
				<label htmlFor="timezone" className="text-lg mb-2">Timezone:</label>
				<select
					name="timezone"
					id="timezone"
					value={formData.timezone ?? ""}
					className="purple-input-box"
					required
					onChange={handleInputChange}
				>
					<option value="" disabled>Select Timezone</option>
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

			<FormError message={timeError ?? submitError} />

			<div className="mt-10 mb-5 flex items-center gap-4">
				<button type="submit" disabled={timeError !== null} className="green-btn green-btn-clickable disabled:cursor-not-allowed disabled:opacity-50">Save Changes</button>
				<CancelButton to={`/events/${id}`} />
			</div>

		</form>
	);
}

export function EventDetailsEdit() {

	const { id } = useParams();

	const { data: event, errorMsg, isLoading } = useAsyncData(
		() => getEventByID(id), "Error Fetching Event Data", id
	);

	if (isLoading || errorMsg || !event) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg ?? "Event not found"} loadingText="Loading event..." />;
	}

	return (
		<section className="flex flex-col gap-4" >
			{/* Header */}
			<div className="header-box">
				<h1 className="header-text">Edit Event</h1>
				<p className="stat-id">
					Event #{id}
				</p>
			</div>

			{/* Edit Form */}
			<EventEditForm id={id} original={event} />
		</section>
	);

}

export default EventDetailsEdit;
