import { useState } from "react";
import { getAvailableMembers } from "../../api/membersApi";
import { addTeamMember } from "../../api/teamsApi";
import { useAsyncData } from "../../hooks/useAsyncData";
import FormError from "./FormError";

type AddPlayerFormProps = {
	teamId: string | undefined,
	// Current active members per position, e.g. { Captain: 1, Player: 3 }
	positionCounts: Record<string, number>,
	refreshKey: number,
	onAdded: () => void
};

// Roster shape enforced by the server too: up to 6 members
const POSITION_LIMITS: Record<string, number> = { Player: 4, Captain: 1, Substitute: 1 };
const POSITIONS = Object.keys(POSITION_LIMITS);

export function AddPlayerForm({ teamId, positionCounts, refreshKey, onAdded }: AddPlayerFormProps) {

	// Only active members who aren't on a team come back, so taken members can't be picked
	const { data: members, errorMsg, isLoading } = useAsyncData(
		getAvailableMembers, "Error fetching available members", refreshKey
	);

	const [memberId, setMemberId] = useState<string>("");
	const isFull = (option: string) => (positionCounts[option] ?? 0) >= POSITION_LIMITS[option];
	const firstOpen = POSITIONS.find(option => !isFull(option)) ?? "Player";

	const [position, setPosition] = useState<string>(firstOpen);
	const [startDate, setStartDate] = useState<string>(() => new Date().toLocaleDateString("en-CA")); // YYYY-MM-DD, local
	const [submitError, setSubmitError] = useState<string | null>(null);

	const positionFull = isFull(position);
	const rosterFull = POSITIONS.every(isFull);

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault(); // Do not refresh browser on submit

		if (positionFull) return;

		setSubmitError(null);

		try {
			await addTeamMember(teamId, { member_id: Number(memberId), team_position: position, start_date: startDate });
			setMemberId("");
			setPosition(firstOpen);
			onAdded();
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : "Error adding player");
		}
	};

	if (isLoading) return <p className="text-purple-300">Loading members...</p>;
	if (errorMsg || !members) return <div className="stat-card">{errorMsg}</div>;

	if (rosterFull) {
		return <div className="stat-card text-slate-400">The roster is full (1 Captain, 4 Players, 1 Substitute).</div>;
	}

	if (members.length === 0) {
		return <div className="stat-card text-slate-400">Every active member is already on a team.</div>;
	}

	return (
		<form onSubmit={handleSubmit} className="stat-card">
			<div className="form-grid">

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
						<option key={option} value={option} disabled={isFull(option)}>
							{option} ({positionCounts[option] ?? 0}/{POSITION_LIMITS[option]}){isFull(option) ? " - full" : ""}
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

			<FormError message={positionFull ? `The ${position} spots are full.` : submitError} />

			<div className="mt-8 mb-3">
				<button type="submit" disabled={positionFull} className="green-btn green-btn-clickable disabled:cursor-not-allowed disabled:opacity-50">
					Add Player
				</button>
			</div>
		</form>
	);
}

export default AddPlayerForm;
