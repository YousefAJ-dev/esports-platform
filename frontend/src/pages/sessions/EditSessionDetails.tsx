import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { convertDateToInput, inputChangeHandler } from "../../helper/helperFunctions";
import type { SessionSummary } from "../../types/sessions";
import { getSessionByID, updateSessionByID } from "../../api/sessionsApi";

export function EditSessionDetails() {

	const [formData, setFormData] = useState<SessionSummary | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

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
				console.log(data);
				setFormData({
					...data,
					scheduled_start: convertDateToInput(data.scheduled_start),
					scheduled_end: convertDateToInput(data.scheduled_end),
					actual_start: data.actual_start ? convertDateToInput(data.actual_start) : undefined,
					actual_end: data.actual_end ? convertDateToInput(data.actual_end) : undefined,
				});

			} catch {
				setErrorMsg("Error Fetching Event Data");
			} finally {
				setIsLoading(false);
			}
		}

		loadFormData();

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

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		inputChangeHandler(e, setFormData)
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!id){
			return <p>No ID Found</p>;
		}

		try {
			await updateSessionByID(id, formData);
			navigate(`/sessions`);
		} catch (error) {
			
		}
	}

	return (
		<section className="flex flex-col gap-4" >
			{/* Header */}
			<div className="header-box">
				<h1>Edit Session</h1>
				<p className="stat-id">
					Session #{id}
				</p>
			</div>

			{/* Edit Form */}
			<form 
			onSubmit={handleSubmit}
			className="mt-10 stat-card"
			>

				<div className="mt-7 grid grid-cols-[160px_1fr] gap-x-4 gap-y-5 items-center">

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
						value={formData.actual_start}
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
						value={formData.actual_end}
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
						<option value="Upcoming">Upcoming</option>
					</select>
				</div>

				<div>
					<button type="submit" className="green-btn green-btn-clickable mt-10 mb-5">Save Changes</button>
				</div>
			</form>
		</section>
	);

}

export default EditSessionDetails;