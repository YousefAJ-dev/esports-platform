import { useState } from "react";
import { useNavigate } from "react-router";
import { createMember } from "../../api/membersApi";
import FormField from "../../components/ui/FormField";
import { inputChangeHandler } from "../../helper/helperFunctions";
import type { CreateMemberPayload } from "../../types/members";
import CancelButton from "../../components/ui/CancelButton";
import FormError from "../../components/ui/FormError";
import { useAuth } from "../../context/authContext";
import { isAdmin } from "../../helper/permissions";

export function CreateMemberPage() {

	const { user } = useAuth();

	const navigate = useNavigate();

	const [formData, setFormData] = useState<CreateMemberPayload>({
		real_name: "",
		display_name: "",
		date_of_birth: "",
		is_active: true
	});
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		inputChangeHandler(e, setFormData);
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault(); // Do not refresh browser on submit

		try {
			const member = await createMember(formData);
			navigate(`/members/${member.member_id}`);
		} catch (error) {
			setErrorMsg(error instanceof Error ? error.message : "Error creating member");
		}
	};

	return (
		<div>
			<section className="mx-auto max-w-6xl space-y-8">
				<div className="header-box">
					<h1 className="header-text">Create Member</h1>
				</div>

				<form onSubmit={handleSubmit} className="stat-card">
					<div className="form-grid">
						<FormField label="Real Name:" name="real_name" type="text" value={formData.real_name} onChange={handleInputChange} required />
						<FormField label="Display Name:" name="display_name" type="text" value={formData.display_name} onChange={handleInputChange} required />
						<FormField label="Date of Birth:" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleInputChange} required />
						{/* Activating/deactivating is Admin-only (the server rejects it for anyone else) */}
						{isAdmin(user) && <FormField label="Active:" name="is_active" type="checkbox" checked={formData.is_active} onChange={handleInputChange} className="h-5 w-5" />}
					</div>

					<FormError message={errorMsg} />

					<div className="mt-10 mb-5 flex items-center gap-4">
						<button type="submit" className="green-btn green-btn-clickable">Create Member</button>
						<CancelButton to="/members" />
					</div>
				</form>
			</section>
		</div>
	);
}

export default CreateMemberPage;
