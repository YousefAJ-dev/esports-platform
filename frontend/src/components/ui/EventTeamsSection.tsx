import { useState } from "react";
import { Link } from "react-router";
import { getEventTeams, registerEventTeam, unregisterEventTeam } from "../../api/eventsApi";
import { getTeams } from "../../api/teamsApi";
import { useAsyncData } from "../../hooks/useAsyncData";
import type { Crumb } from "../../types/navigation";
import FormError from "./FormError";

type EventTeamsSectionProps = {
	eventId: string | undefined,
	eventStatus: string,
	trail: Crumb[],
	// Register/withdraw controls are only for the event's Organizer or an Admin
	canManage: boolean
};

// Registered teams for an event, with register/withdraw. The server enforces the same rules.
export function EventTeamsSection({ eventId, eventStatus, trail, canManage }: EventTeamsSectionProps) {

	// Bumped after a change so the registered list and the dropdown reload together
	const [version, setVersion] = useState(0);
	const [selectedTeam, setSelectedTeam] = useState("");
	const [actionError, setActionError] = useState<string | null>(null);

	const { data, errorMsg, isLoading } = useAsyncData(
		async () => {
			const [registered, teams] = await Promise.all([getEventTeams(eventId), getTeams()]);
			return { registered, teams };
		},
		"Error fetching event teams",
		`${eventId}:${version}`
	);

	if (isLoading) return <p className="text-purple-300">Loading teams...</p>;
	if (errorMsg || !data) return <div className="stat-card">{errorMsg}</div>;

	const isClosed = eventStatus === "Completed" || eventStatus === "Cancelled";
	const showControls = canManage && !isClosed;
	const registeredIds = new Set(data.registered.map(team => team.team_id));
	const available = data.teams.filter(team => team.is_active && !registeredIds.has(team.team_id));

	const run = async (action: () => Promise<unknown>) => {
		setActionError(null);
		try {
			await action();
			setSelectedTeam("");
			setVersion(v => v + 1);
		} catch (error) {
			setActionError(error instanceof Error ? error.message : "Something went wrong");
		}
	};

	const handleRegister = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault(); // Do not refresh browser on submit
		run(() => registerEventTeam(eventId, Number(selectedTeam)));
	};

	return (
		<div className="space-y-4">
			{data.registered.length === 0 ? (
				<div className="stat-card text-slate-400">No teams registered yet. Register teams before scheduling matches.</div>
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{data.registered.map(team => (
						<div key={team.team_id} className="stat-card flex items-center justify-between gap-3 py-3">
							<Link to={`/teams/${team.team_id}`} state={{ trail }} className="min-w-0 hover:text-purple-300">
								<p className="truncate font-semibold text-white">{team.team_name}</p>
								<p className="text-xs text-slate-500">
									{team.match_count} match{team.match_count === 1 ? "" : "es"}
								</p>
							</Link>

							{/* A team already scheduled into a match has to be removed from it first */}
							{showControls && (
								<button
									type="button"
									onClick={() => run(() => unregisterEventTeam(eventId, team.team_id))}
									disabled={team.match_count > 0}
									title={team.match_count > 0 ? "Remove this team from its matches first" : undefined}
									className="shrink-0 text-sm text-slate-400 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-slate-400"
								>
									Withdraw
								</button>
							)}
						</div>
					))}
				</div>
			)}

			{!canManage ? null : isClosed ? (
				<p className="text-sm text-slate-500">Registration is closed for {eventStatus.toLowerCase()} events.</p>
			) : (
				<form onSubmit={handleRegister} className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<select
						value={selectedTeam}
						onChange={e => setSelectedTeam(e.target.value)}
						required
						aria-label="Team to register"
						className="purple-input-box sm:max-w-sm"
					>
						<option value="">{available.length === 0 ? "All active teams are registered" : "Select a team to register"}</option>
						{available.map(team => <option key={team.team_id} value={team.team_id}>{team.team_name}</option>)}
					</select>
					<button type="submit" disabled={!selectedTeam} className="green-btn green-btn-clickable disabled:cursor-not-allowed disabled:opacity-50">
						Register Team
					</button>
				</form>
			)}

			<FormError message={actionError} />
		</div>
	);
}

export default EventTeamsSection;
