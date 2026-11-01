import { useState } from "react";
import { getSessionTeams, updateSessionResults } from "../../api/sessionsApi";
import { useAsyncData } from "../../hooks/useAsyncData";
import type { MatchResult, SessionTeam } from "../../types/sessions";

type MatchResultsFormProps = {
	sessionId: string | undefined,
	refreshKey?: number
};

type ResultsEditorProps = {
	sessionId: string | undefined,
	teams: SessionTeam[]
};

// Kept separate from the session form so results can be saved on their own
function ResultsEditor({ sessionId, teams }: ResultsEditorProps) {

	// Score is held as a string while editing so the input can be cleared
	const [scores, setScores] = useState<Record<number, string>>(
		() => Object.fromEntries(teams.map(team => [team.team_id, team.score?.toString() ?? ""]))
	);
	const [winnerId, setWinnerId] = useState<number | null>(
		() => teams.find(team => team.is_winner)?.team_id ?? null
	);
	const [message, setMessage] = useState<string | null>(null);

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault(); // Do not refresh browser on submit

		const results: MatchResult[] = teams.map(team => ({
			team_id: team.team_id,
			score: scores[team.team_id] === "" ? null : Number(scores[team.team_id]),
			is_winner: team.team_id === winnerId
		}));

		try {
			await updateSessionResults(sessionId, { results });
			setMessage("Results saved");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Error saving results");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="stat-card">
			<div className="mt-3 grid grid-cols-[1fr_120px_100px] items-center gap-x-4 gap-y-4">
				<p className="light-text">Team</p>
				<p className="light-text">Score</p>
				<p className="light-text">Winner</p>

				{teams.map(team => (
					<div key={team.team_id} className="contents">
						<label htmlFor={`score-${team.team_id}`} className="text-lg">{team.team_name}</label>
						<input
							id={`score-${team.team_id}`}
							type="number"
							min={0}
							value={scores[team.team_id]}
							onChange={e => setScores(current => ({ ...current, [team.team_id]: e.target.value }))}
							className="purple-input-box"
						/>
						<input
							type="radio"
							name="winner"
							aria-label={`${team.team_name} won`}
							checked={winnerId === team.team_id}
							onChange={() => setWinnerId(team.team_id)}
							className="h-5 w-5"
						/>
					</div>
				))}
			</div>

			<div className="mt-8 mb-3 flex items-center gap-4">
				<button type="submit" className="green-btn green-btn-clickable">Save Results</button>
				{/* Lets a winner be removed, e.g. for a match that ended in a draw */}
				<button type="button" onClick={() => setWinnerId(null)} className="text-sm text-slate-400 hover:text-purple-300">
					Clear winner
				</button>
				{message && <p className="text-purple-300">{message}</p>}
			</div>
		</form>
	);
}

export function MatchResultsForm({ sessionId, refreshKey = 0 }: MatchResultsFormProps) {

	const { data: teams, errorMsg, isLoading } = useAsyncData(
		() => getSessionTeams(sessionId), "Error fetching match teams", `${sessionId}:${refreshKey}`
	);

	if (isLoading) return <p className="text-purple-300">Loading results...</p>;
	if (errorMsg || !teams) return <div className="stat-card">{errorMsg}</div>;

	if (teams.length === 0) {
		return (
			<div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
				Assign teams to this match before entering results.
			</div>
		);
	}

	// Keyed on the team IDs so the editor's score state resets when the teams change
	return <ResultsEditor key={teams.map(team => team.team_id).join("-")} sessionId={sessionId} teams={teams} />;
}

export default MatchResultsForm;
