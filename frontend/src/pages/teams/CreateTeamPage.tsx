import { useState } from "react";
import { useNavigate } from "react-router";
import { createTeam } from "../../api/teamsApi";
import FormField from "../../components/ui/FormField";
import { inputChangeHandler } from "../../helper/helperFunctions";
import type { CreateTeamPayload } from "../../types/teams";
import CancelButton from "../../components/ui/CancelButton";
import FormError from "../../components/ui/FormError";

export function CreateTeamPage() {

	const navigate = useNavigate();

	const [formData, setFormData] = useState<CreateTeamPayload>({
		team_name: "",
		contact_email: "",
		is_active: true
	});
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		inputChangeHandler(e, setFormData);
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault(); // Do not refresh browser on submit

		try {
			const team = await createTeam(formData);
			navigate(`/teams/${team.team_id}`);
		} catch (error) {
			setErrorMsg(error instanceof Error ? error.message : "Error creating team");
		}
	};

	return (
		<div className="min-h-screen p-6">
			<section className="mx-auto max-w-6xl space-y-8">
				<div className="header-box">
					<h1 className="header-text">Create Team</h1>
				</div>

				<form onSubmit={handleSubmit} className="stat-card">
					<div className="form-grid">
						<FormField label="Team Name:" name="team_name" type="text" value={formData.team_name} onChange={handleInputChange} required />
						<FormField label="Contact Email:" name="contact_email" type="email" value={formData.contact_email} onChange={handleInputChange} required />
						<FormField label="Active:" name="is_active" type="checkbox" checked={formData.is_active} onChange={handleInputChange} className="h-5 w-5" />
					</div>

					<FormError message={errorMsg} />

					<div className="mt-10 mb-5 flex items-center gap-4">
						<button type="submit" className="green-btn green-btn-clickable">Create Team</button>
						<CancelButton to="/teams" />
					</div>
				</form>
			</section>
		</div>
	);
}

export default CreateTeamPage;
