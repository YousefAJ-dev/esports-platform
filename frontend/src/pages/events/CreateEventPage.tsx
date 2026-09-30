import { useState } from "react";
import { useNavigate } from "react-router";
import type { CreateEventPayload } from "../../types/events";
import { inputChangeHandler } from "../../helper/helperFunctions";
import { createEvent } from "../../api/eventsApi";

export function EventCreatePage(){
	
	const navigate = useNavigate();
	const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;


	const [ formData, setFormData] = useState<CreateEventPayload>({
		event_name: "",
		description: "",
		location: "",
		start_on: "",
		end_on: "",
		timezone: browserTimeZone,
		status: "Upcoming",
	});

	const [ errorMsg, setErrorMsg ] = useState<string | null>(null);

	const timeZones = Intl.supportedValuesOf("timeZone");

	const handleInputChange = (e:React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		inputChangeHandler(e, setFormData);
	}

	const handleSubmit = async (e:React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			const event = await createEvent(formData);
			navigate(`/events/${event.event_id}`)
		} catch (error) {
			console.error("Error Creating Event", error);
		}
		
	};



	return(
		<div className="min-h-screen p-6">
			<section className="mx-auto max-w-6xl space-y-8">
				{/* SECTION HEADER */}
				<div className="header-box">
					<h1>Create Event</h1>
				</div>
				{/* Event Form*/}
				<form 
				onSubmit={handleSubmit}
				className="stat-card"
				>
					<div className="mt-7 grid grid-cols-[160px_1fr] gap-x-4 gap-y-5 items-center">
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
		</div>
	);
}

export default EventCreatePage;