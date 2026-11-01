import { useState } from "react";
import { getSessionTeams, updateSessionTeams } from "../../api/sessionsApi";
import { getTeams } from "../../api/teamsApi";
import { useAsyncData } from "../../hooks/useAsyncData";
import type { TeamSummary } from "../../types/teams";
import FormError from "./FormError";
import MatchTeamPicker, { type TeamSlots } from "./MatchTeamPicker";

type MatchTeamsFormProps = {
	sessionId: string | undefined,
	status: string,
	onSaved: () => void
};

type TeamsEditorProps = MatchTeamsFormProps & {
	teams: TeamSummary[],
	initial: TeamSlots
};

function TeamsEditor({ sessionId, status, onSaved, teams, initial }: TeamsEditorProps) {

	const [teamSlots, setTeamSlots] = useState<TeamSlots>(initial);
	const [savedSlots, setSavedSlots] = useState<TeamSlots>(initial);
	const [message, setMessage] = useState<string | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);

	// Completed matches are locked (the server enforces this too)
	const isLocked = status === "Completed";
	const isUnchanged = teamSlots[0] === savedSlots[0] && teamSlots[1] === savedSlots[1];

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault(); // Do not refresh browser on submit

		setMessage(null);
		setSubmitError(null);

		try {
			await updateSessionTeams(sessionId, { team_ids: teamSlots.map(Number) });
			setSavedSlots(teamSlots);
			setMessage("Teams saved");
			onSaved();
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : "Error saving teams");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="stat-card">
			<div className="form-grid">
				<MatchTeamPicker teams={teams} value={teamSlots} onChange={setTeamSlots} disabled={isLocked} />
			</div>

			{isLocked
				? <p className="mt-5 text-slate-400">Teams can't be changed once a match is completed.</p>
				: <p className="mt-5 text-slate-400">Replacing a team removes any score recorded for it.</p>}

			<FormError message={submitError} />

			<div className="mt-8 mb-3 flex items-center gap-4">
				<button type="submit" disabled={isLocked || isUnchanged} className="green-btn green-btn-clickable disabled:cursor-not-allowed disabled:opacity-50">
					Save Teams
				</button>
				{message && <p className="text-purple-300">{message}</p>}
			</div>
		</form>
	);
}

// Kept separate from the session form so teams can be saved on their own
export function MatchTeamsForm(props: MatchTeamsFormProps) {

	const { sessionId } = props;

	// All teams for the dropdowns plus the two currently in the match
	const { data, errorMsg, isLoading } = useAsyncData(
		async () => {
			const [teams, current] = await Promise.all([getTeams(), getSessionTeams(sessionId)]);
			return { teams, current };
		},
		"Error fetching match teams",
		sessionId
	);

	if (isLoading) return <p className="text-purple-300">Loading teams...</p>;
	if (errorMsg || !data) return <div className="stat-card">{errorMsg}</div>;

	const initial: TeamSlots = [
		data.current[0] ? String(data.current[0].team_id) : "",
		data.current[1] ? String(data.current[1].team_id) : ""
	];

	return <TeamsEditor {...props} teams={data.teams} initial={initial} />;
}

export default MatchTeamsForm;
