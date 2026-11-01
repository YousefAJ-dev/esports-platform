import { useState } from "react";
import { getAvailableMembers } from "../../api/membersApi";
import { addTeamMember } from "../../api/teamsApi";
import { useAsyncData } from "../../hooks/useAsyncData";
import FormError from "./FormError";

type AddPlayerFormProps = {
	teamId: string | undefined,
	hasCaptain: boolean,
	refreshKey: number,
	onAdded: () => void
};

const POSITIONS = ["Player", "Captain", "Substitute"];

export function AddPlayerForm({ teamId, hasCaptain, refreshKey, onAdded }: AddPlayerFormProps) {

	// Only active members who aren't on a team come back, so taken members can't be picked
	const { data: members, errorMsg, isLoading } = useAsyncData(
		getAvailableMembers, "Error fetching available members", refreshKey
	);

	const [memberId, setMemberId] = useState<string>("");
	const [position, setPosition] = useState<string>("Player");
	const [startDate, setStartDate] = useState<string>(() => new Date().toLocaleDateString("en-CA")); // YYYY-MM-DD, local
	const [submitError, setSubmitError] = useState<string | null>(null);

	const captainTaken = hasCaptain && position === "Captain";

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault(); // Do not refresh browser on submit

		if (captainTaken) return;

		setSubmitError(null);

		try {
			await addTeamMember(teamId, { member_id: Number(memberId), team_position: position, start_date: startDate });
			setMemberId("");
			setPosition("Player");
			onAdded();
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : "Error adding player");
		}
	};

	if (isLoading) return <p className="text-purple-300">Loading members...</p>;
	if (errorMsg || !members) return <div className="stat-card">{errorMsg}</div>;

	if (members.length === 0) {
		return <div className="stat-card text-slate-400">Every active member is already on a team.</div>;
	}

	return (
		<form onSubmit={handleSubmit} className="stat-card">
			<div className="mt-3 grid grid-cols-[160px_1fr] gap-x-4 gap-y-5 items-center">

				{/* Member */}
				<label htmlFor="member_id" className="text-lg mb-2">Member:</label>
				<select
					id="member_id"
					value={memberId}
					required
					onChange={e => setMemberId(e.target.value)}
					className="purple-input-box"
				>
					<option value="">Select a Member</option>
					{members.map(member => (
						<option key={member.member_id} value={member.member_id}>
							{member.display_name} ({member.real_name})
						</option>
					))}
				</select>

				{/* Position - a team only gets one captain */}
				<label htmlFor="team_position" className="text-lg mb-2">Position:</label>
				<select
					id="team_position"
					value={position}
					required
					onChange={e => setPosition(e.target.value)}
					className="purple-input-box"
				>
					{POSITIONS.map(option => (
						<option key={option} value={option} disabled={option === "Captain" && hasCaptain}>
							{option === "Captain" && hasCaptain ? "Captain (already assigned)" : option}
						</option>
					))}
				</select>

				{/* Start Date */}
				<label htmlFor="start_date" className="text-lg mb-2">Start Date:</label>
				<input
					id="start_date"
					type="date"
					value={startDate}
					required
					onChange={e => setStartDate(e.target.value)}
					className="purple-input-box"
				/>
			</div>

			<FormError message={captainTaken ? "This team already has a captain." : submitError} />

			<div className="mt-8 mb-3">
				<button type="submit" disabled={captainTaken} className="green-btn green-btn-clickable disabled:cursor-not-allowed disabled:opacity-50">
					Add Player
				</button>
			</div>
		</form>
	);
}

export default AddPlayerForm;
