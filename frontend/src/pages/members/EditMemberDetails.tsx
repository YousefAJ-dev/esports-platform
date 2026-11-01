import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getMemberByID, updateMemberByID } from "../../api/membersApi";
import FormField from "../../components/ui/FormField";
import StatusMessage from "../../components/ui/StatusMessage";
import { getChangedFields, inputChangeHandler } from "../../helper/helperFunctions";
import { useAsyncData } from "../../hooks/useAsyncData";
import type { MemberSummary } from "../../types/members";
import CancelButton from "../../components/ui/CancelButton";
import FormError from "../../components/ui/FormError";

type MemberEditFormProps = {
	id: string | undefined,
	original: MemberSummary
};

// Form is its own component so its state can be seeded directly from the fetched member
function MemberEditForm({ id, original }: MemberEditFormProps) {

	const navigate = useNavigate();
	const [formData, setFormData] = useState<MemberSummary>(original);
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
				await updateMemberByID(id, changes);
			}
			navigate(`/members/${id}`);
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : "Error updating member");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="mt-10 stat-card">
			<div className="form-grid">
				<FormField label="Real Name:" name="real_name" type="text" value={formData.real_name} onChange={handleInputChange} required />
				<FormField label="Display Name:" name="display_name" type="text" value={formData.display_name} onChange={handleInputChange} required />
				<FormField label="Date of Birth:" name="date_of_birth" type="date" value={formData.date_of_birth ?? ""} onChange={handleInputChange} required />
				<FormField label="Active:" name="is_active" type="checkbox" checked={formData.is_active} onChange={handleInputChange} className="h-5 w-5" />
			</div>

			<FormError message={submitError} />

			<div className="mt-10 mb-5 flex items-center gap-4">
				<button type="submit" className="green-btn green-btn-clickable">Save Changes</button>
				<CancelButton to={`/members/${id}`} />
			</div>
		</form>
	);
}

export function EditMemberDetails() {

	const { id } = useParams();

	const { data: member, errorMsg, isLoading } = useAsyncData(
		() => getMemberByID(id), "Error fetching member data", id
	);

	if (isLoading || errorMsg || !member) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg ?? "Member not found"} loadingText="Loading member..." />;
	}

	return (
		<section className="flex flex-col gap-4">
			<div className="header-box">
				<h1 className="header-text">Edit Member</h1>
				<p className="stat-id">Member #{id}</p>
			</div>
			<MemberEditForm id={id} original={member} />
		</section>
	);
}

export default EditMemberDetails;
