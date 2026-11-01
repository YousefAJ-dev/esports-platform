import { useState } from "react";
import { getRoles, updateUserRoles, updateUserTeam } from "../../api/usersApi";
import { getTeams } from "../../api/teamsApi";
import { useAsyncData } from "../../hooks/useAsyncData";
import type { TeamSummary } from "../../types/teams";
import type { Role, UserOverview } from "../../types/users";
import FormError from "./FormError";

type UserAccessPanelProps = {
	userId: string | undefined,
	user: UserOverview,
	// The Admin viewing their own account can't drop their own Admin role
	isSelf: boolean,
	onSaved: () => void
};

type AccessEditorProps = UserAccessPanelProps & {
	roles: Role[],
	teams: TeamSummary[]
};

const sameSet = (a: number[], b: number[]) => a.length === b.length && a.every(item => b.includes(item));

// Admin-only: which roles a user has and, for Team Managers, which team they run.
// The server enforces the same rules (no self-demotion, one manager per team).
function AccessEditor({ userId, user, isSelf, onSaved, roles, teams }: AccessEditorProps) {

	const [roleIds, setRoleIds] = useState<number[]>(user.role_ids);
	const [teamId, setTeamId] = useState<string>(user.managed_team_id ? String(user.managed_team_id) : "");
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const adminRoleId = roles.find(role => role.role_name === "Admin")?.role_id;
	const isTeamManager = user.roles.includes("Team Manager");
	const rolesChanged = !sameSet(roleIds, user.role_ids);
	const teamChanged = teamId !== (user.managed_team_id ? String(user.managed_team_id) : "");

	const toggleRole = (roleId: number) => {
		setRoleIds(current => current.includes(roleId) ? current.filter(item => item !== roleId) : [...current, roleId]);
	};

	const save = async (action: () => Promise<unknown>, success: string) => {
		setMessage(null);
		setError(null);
		try {
			await action();
			setMessage(success);
			onSaved();
		} catch (saveError) {
			setError(saveError instanceof Error ? saveError.message : "Couldn't save");
		}
	};

	// Free teams, plus this user's own team; teams run by someone else are shown but disabled
	const assignableTeams = teams.filter(team => team.is_active || team.team_id === user.managed_team_id);

	return (
		<div className="stat-card space-y-6">

			{/* Roles */}
			<div>
				<h3 className="text-lg font-semibold text-white">Roles</h3>
				<p className="text-sm text-slate-400">A user gets everything each of their roles allows.</p>

				<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
					{roles.map(role => {
						const lockedOn = isSelf && role.role_id === adminRoleId;

						return (
							<label
								key={role.role_id}
								className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${roleIds.includes(role.role_id) ? "border-purple-600/60 bg-purple-950/40" : "border-slate-800"} ${lockedOn ? "opacity-60" : "cursor-pointer"}`}
							>
								<input
									type="checkbox"
									checked={roleIds.includes(role.role_id)}
									onChange={() => toggleRole(role.role_id)}
									disabled={lockedOn}
									className="h-4 w-4"
								/>
								<span className="text-white">{role.role_name}</span>
								{lockedOn && <span className="text-xs text-slate-500">(your own Admin role)</span>}
							</label>
						);
					})}
				</div>

				{isTeamManager && !roleIds.includes(roles.find(role => role.role_name === "Team Manager")?.role_id ?? -1) && user.manager_of && (
					<p className="mt-3 text-sm text-amber-300">Removing Team Manager also takes them off {user.manager_of}.</p>
				)}

				<button
					type="button"
					disabled={!rolesChanged}
					onClick={() => save(() => updateUserRoles(userId, roleIds), "Roles saved")}
					className="green-btn green-btn-clickable mt-4 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Save Roles
				</button>
			</div>

			{/* Managed team - only for Team Managers */}
			<div className="border-t border-slate-800 pt-6">
				<h3 className="text-lg font-semibold text-white">Managed Team</h3>

				{!isTeamManager ? (
					<p className="mt-1 text-sm text-slate-400">Give this user the Team Manager role (and save) to assign them a team.</p>
				) : (
					<>
						<p className="text-sm text-slate-400">A manager runs one team, and each team has one manager.</p>
						<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
							<select
								value={teamId}
								onChange={e => setTeamId(e.target.value)}
								aria-label="Managed team"
								className="purple-input-box sm:max-w-sm"
							>
								<option value="">No team</option>
								{assignableTeams.map(team => {
									const takenBySomeoneElse = team.manager_user_id != null && team.team_id !== user.managed_team_id;
									return (
										<option key={team.team_id} value={team.team_id} disabled={takenBySomeoneElse}>
											{team.team_name}{takenBySomeoneElse ? ` (managed by ${team.manager_name})` : ""}
										</option>
									);
								})}
							</select>
							<button
								type="button"
								disabled={!teamChanged}
								onClick={() => save(() => updateUserTeam(userId, teamId ? Number(teamId) : null), "Team assignment saved")}
								className="green-btn green-btn-clickable disabled:cursor-not-allowed disabled:opacity-50"
							>
								Save Team
							</button>
						</div>
					</>
				)}
			</div>

			<FormError message={error} />
			{message && <p className="text-purple-300">{message}</p>}
		</div>
	);
}

export function UserAccessPanel(props: UserAccessPanelProps) {

	// Role list and teams (with their current managers) load together
	const { data, errorMsg, isLoading } = useAsyncData(
		async () => {
			const [roles, teams] = await Promise.all([getRoles(), getTeams()]);
			return { roles, teams };
		},
		"Error loading roles and teams",
		`${props.userId}:${props.user.role_ids.join(",")}:${props.user.managed_team_id}`
	);

	if (isLoading) return <p className="text-purple-300">Loading access...</p>;
	if (errorMsg || !data) return <div className="stat-card">{errorMsg}</div>;

	// After a save the page reloads the user, so "changed" checks compare against the new saved state
	return <AccessEditor {...props} roles={data.roles} teams={data.teams} />;
}

export default UserAccessPanel;
