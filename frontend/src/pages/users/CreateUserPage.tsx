import { useState } from "react";
import { useNavigate } from "react-router";
import { createUser } from "../../api/usersApi";
import FormField from "../../components/ui/FormField";
import { inputChangeHandler } from "../../helper/helperFunctions";
import type { CreateUserPayload } from "../../types/users";
import CancelButton from "../../components/ui/CancelButton";
import FormError from "../../components/ui/FormError";

export function CreateUserPage() {

	const navigate = useNavigate();

	const [formData, setFormData] = useState<CreateUserPayload>({
		first_name: "",
		last_name: "",
		username: "",
		email: "",
		password: "",
		is_active: true
	});
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		inputChangeHandler(e, setFormData);
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault(); // Do not refresh browser on submit

		try {
			const user = await createUser(formData);
			navigate(`/users/${user.user_id}`);
		} catch (error) {
			setErrorMsg(error instanceof Error ? error.message : "Error creating user");
		}
	};

	return (
		<div>
			<section className="mx-auto max-w-6xl space-y-8">
				<div className="header-box">
					<h1 className="header-text">Create User</h1>
				</div>

				<form onSubmit={handleSubmit} className="stat-card">
					<div className="form-grid">
						<FormField label="First Name:" name="first_name" type="text" value={formData.first_name} onChange={handleInputChange} required />
						<FormField label="Last Name:" name="last_name" type="text" value={formData.last_name} onChange={handleInputChange} required />
						<FormField label="Username:" name="username" type="text" value={formData.username} onChange={handleInputChange} required />
						<FormField label="Email:" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
						<FormField label="Password:" name="password" type="password" value={formData.password} onChange={handleInputChange} autoComplete="new-password" required />
						<FormField label="Active:" name="is_active" type="checkbox" checked={formData.is_active} onChange={handleInputChange} className="h-5 w-5" />
					</div>

					<FormError message={errorMsg} />

					<div className="mt-10 mb-5 flex items-center gap-4">
						<button type="submit" className="green-btn green-btn-clickable">Create User</button>
						<CancelButton to="/users" />
					</div>
				</form>
			</section>
		</div>
	);
}

export default CreateUserPage;
