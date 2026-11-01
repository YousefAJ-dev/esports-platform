import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getTeamByID, updateTeamByID } from "../../api/teamsApi";
import FormField from "../../components/ui/FormField";
import StatusMessage from "../../components/ui/StatusMessage";
import { getChangedFields, inputChangeHandler } from "../../helper/helperFunctions";
import { useAsyncData } from "../../hooks/useAsyncData";
import type { TeamSummary } from "../../types/teams";
import CancelButton from "../../components/ui/CancelButton";
import FormError from "../../components/ui/FormError";

type TeamEditFormProps = {
	id: string | undefined,
	original: TeamSummary
};

// Form is its own component so its state can be seeded directly from the fetched team
function TeamEditForm({ id, original }: TeamEditFormProps) {

	const navigate = useNavigate();
	const [formData, setFormData] = useState<TeamSummary>(original);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		inputChangeHandler(e, setFormData);
	};

	const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault(); // Do not refresh browser on submit

		// Send only what changed, and skip the request entirely if nothing did
		const changes = getChangedFields(original, formData);

		try {
			if (Object.keys(changes).length > 0) {
				await updateTeamByID(id, changes);
			}
			navigate(`/teams/${id}`);
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : "Error updating team");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="mt-10 stat-card">
			<div className="form-grid">
				<FormField label="Team Name:" name="team_name" type="text" value={formData.team_name} onChange={handleInputChange} required />
				<FormField label="Contact Email:" name="contact_email" type="email" value={formData.contact_email} onChange={handleInputChange} required />
				<FormField label="Active:" name="is_active" type="checkbox" checked={formData.is_active} onChange={handleInputChange} className="h-5 w-5" />
			</div>

			<FormError message={submitError} />

			<div className="mt-10 mb-5 flex items-center gap-4">
				<button type="submit" className="green-btn green-btn-clickable">Save Changes</button>
				<CancelButton to={`/teams/${id}`} />
			</div>
		</form>
	);
}

export function EditTeamDetails() {

	const { id } = useParams();

	const { data: team, errorMsg, isLoading } = useAsyncData(
		() => getTeamByID(id), "Error fetching team data", id
	);

	if (isLoading || errorMsg || !team) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg ?? "Team not found"} loadingText="Loading team..." />;
	}

	return (
		<section className="flex flex-col gap-4">
			<div className="header-box">
				<h1 className="header-text">Edit Team</h1>
				<p className="stat-id">Team #{id}</p>
			</div>
			<TeamEditForm id={id} original={team} />
		</section>
	);
}

export default EditTeamDetails;
