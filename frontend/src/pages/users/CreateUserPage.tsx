import { useState } from "react";
import { useNavigate } from "react-router";
import { createUser } from "../../api/usersApi";
import FormField from "../../components/ui/FormField";
import { inputChangeHandler } from "../../helper/helperFunctions";
import type { CreateUserPayload } from "../../types/users";

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
		<div className="min-h-screen p-6">
			<section className="mx-auto max-w-6xl space-y-8">
				<div className="header-box">
					<h1>Create User</h1>
				</div>

				<form onSubmit={handleSubmit} className="stat-card">
					<div className="mt-7 grid grid-cols-[160px_1fr] gap-x-4 gap-y-5 items-center">
						<FormField label="First Name:" name="first_name" type="text" value={formData.first_name} onChange={handleInputChange} required />
						<FormField label="Last Name:" name="last_name" type="text" value={formData.last_name} onChange={handleInputChange} required />
						<FormField label="Username:" name="username" type="text" value={formData.username} onChange={handleInputChange} required />
						<FormField label="Email:" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
						<FormField label="Password:" name="password" type="password" value={formData.password} onChange={handleInputChange} autoComplete="new-password" required />
						<FormField label="Active:" name="is_active" type="checkbox" checked={formData.is_active} onChange={handleInputChange} className="h-5 w-5" />
					</div>

					{errorMsg && <p className="mt-5 text-red-400">{errorMsg}</p>}

					<div>
						<button type="submit" className="green-btn green-btn-clickable mt-10 mb-5">Create User</button>
					</div>
				</form>
			</section>
		</div>
	);
}

export default CreateUserPage;
