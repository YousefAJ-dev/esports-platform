import { useState } from "react";
import { useNavigate } from "react-router";
import { createMember } from "../../api/membersApi";
import FormField from "../../components/ui/FormField";
import { inputChangeHandler } from "../../helper/helperFunctions";
import type { CreateMemberPayload } from "../../types/members";

export function CreateMemberPage() {

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
		<div className="min-h-screen p-6">
			<section className="mx-auto max-w-6xl space-y-8">
				<div className="header-box">
					<h1>Create Member</h1>
				</div>

				<form onSubmit={handleSubmit} className="stat-card">
					<div className="mt-7 grid grid-cols-[160px_1fr] gap-x-4 gap-y-5 items-center">
						<FormField label="Real Name:" name="real_name" type="text" value={formData.real_name} onChange={handleInputChange} required />
						<FormField label="Display Name:" name="display_name" type="text" value={formData.display_name} onChange={handleInputChange} required />
						<FormField label="Date of Birth:" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleInputChange} required />
						<FormField label="Active:" name="is_active" type="checkbox" checked={formData.is_active} onChange={handleInputChange} className="h-5 w-5" />
					</div>

					{errorMsg && <p className="mt-5 text-red-400">{errorMsg}</p>}

					<div>
						<button type="submit" className="green-btn green-btn-clickable mt-10 mb-5">Create Member</button>
					</div>
				</form>
			</section>
		</div>
	);
}

export default CreateMemberPage;
