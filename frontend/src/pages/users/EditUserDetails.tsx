import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getUserByID, updateUserByID } from "../../api/usersApi";
import FormField from "../../components/ui/FormField";
import StatusMessage from "../../components/ui/StatusMessage";
import { getChangedFields, inputChangeHandler } from "../../helper/helperFunctions";
import { useAsyncData } from "../../hooks/useAsyncData";
import type { UserSummary } from "../../types/users";
import CancelButton from "../../components/ui/CancelButton";
import FormError from "../../components/ui/FormError";

type UserEditFormProps = {
	id: string | undefined,
	original: UserSummary
};

// Form is its own component so its state can be seeded directly from the fetched user
function UserEditForm({ id, original }: UserEditFormProps) {

	const navigate = useNavigate();
	const [formData, setFormData] = useState<UserSummary>(original);
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
				await updateUserByID(id, changes);
			}
			navigate(`/users/${id}`);
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : "Error updating user");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="mt-10 stat-card">
			<div className="form-grid">
				<FormField label="First Name:" name="first_name" type="text" value={formData.first_name} onChange={handleInputChange} required />
				<FormField label="Last Name:" name="last_name" type="text" value={formData.last_name} onChange={handleInputChange} required />
				<FormField label="Username:" name="username" type="text" value={formData.username} onChange={handleInputChange} required />
				<FormField label="Email:" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
				<FormField label="Active:" name="is_active" type="checkbox" checked={formData.is_active} onChange={handleInputChange} className="h-5 w-5" />
			</div>

			<FormError message={submitError} />

			<div className="mt-10 mb-5 flex items-center gap-4">
				<button type="submit" className="green-btn green-btn-clickable">Save Changes</button>
				<CancelButton to={`/users/${id}`} />
			</div>
		</form>
	);
}

export function EditUserDetails() {

	const { id } = useParams();

	const { data: user, errorMsg, isLoading } = useAsyncData(
		() => getUserByID(id), "Error fetching user data", id
	);

	if (isLoading || errorMsg || !user) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg ?? "User not found"} loadingText="Loading user..." />;
	}

	return (
		<section className="flex flex-col gap-4">
			<div className="header-box">
				<h1 className="header-text">Edit User</h1>
				<p className="stat-id">User #{id}</p>
			</div>
			<UserEditForm id={id} original={user} />
		</section>
	);
}

export default EditUserDetails;
