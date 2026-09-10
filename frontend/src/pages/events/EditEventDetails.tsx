import { useEffect, useState } from "react";
import type { EventSummary } from "../../types/events";
import { useParams } from "react-router";
import { getEventByID } from "../../api/eventsApi";
import { convertDateToInput, inputChangeHandler } from "../../helper/helperFunctions";

export function EventDetailsEdit() {

	const [formData, setFormData] = useState<EventSummary | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const { id } = useParams();

	const timeZones = Intl.supportedValuesOf("timeZone");

	useEffect(() => {

		async function loadEventData() {
			try {

				const data = await getEventByID(id);
				setFormData(data);

			} catch {
				setErrorMsg("Error Fetching Event Data");
			} finally {
				setIsLoading(false);
			}
		}

		loadEventData();

	}, [id]);

	if (isLoading) {
		<p>Page Is Loading...</p>
	}

	if (errorMsg) {
		return (
			<section className="min-h-screen bg-slate-950 p-6 text-slate-100">
				<p className="text-purple-300">Loading events...</p>
			</section>
		);
	}

	if (!formData) {
		return;
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
		inputChangeHandler(e, setFormData);
	};

	const startDate = convertDateToInput(formData.start_on);
	const endDate = convertDateToInput(formData.end_on);

	return (
		<section className="flex flex-col gap-4" >
			{/* Header */}
			<div className="header-box">
				<h1>Edit Event</h1>
				<p className="stat-id">
					Event #{id}
				</p>
			</div>

			{/* Edit Form */}
			<form className="mt-10 stat-card">

				<div className="mt-7 grid grid-cols-[160px_1fr] gap-x-4 gap-y-5 items-center">


					{/* Event Name */}
					<label htmlFor="eventName" className="text-lg mb-2">
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
					<label htmlFor="start_date" className="text-lg mb-2">
						Start Date:
					</label>
					<div className="flex">
						<input
							id="start_on"
							type="datetime-local"
							name="start_on"
							value={startDate}
							onChange={handleInputChange}
							required
							className="purple-input-box flex-1"
						/>
					</div>

					{/* End Date */}
					<label htmlFor="end_date" className="text-lg mb-2">
						End Date:
					</label>
					<div className="flex">
						<input
							id="end_on"
							type="datetime-local"
							name="end_on"
							value={endDate}
							onChange={handleInputChange}
							required
							className="purple-input-box flex-1"
						/>
					</div>

					{/* timezone */}
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

				<div>
					<button type="submit" className="green-btn green-btn-clickable mt-10 mb-5">Save Changes</button>
				</div>

			</form>
		</section>
	);

}

export default EventDetailsEdit;