import type { TeamSummary } from "../../types/teams";

// Selected team ID per slot, "" when nothing is picked yet
export type TeamSlots = [string, string];

type MatchTeamPickerProps = {
	teams: TeamSummary[],
	value: TeamSlots,
	onChange: (value: TeamSlots) => void,
	disabled?: boolean
};

// Two team dropdowns for the two-column forms. Only active teams are offered (plus whatever is
// already selected, so an existing match still shows its team), and a team picked in one slot
// is left out of the other so a team can't face itself.
export function MatchTeamPicker({ teams, value, onChange, disabled = false }: MatchTeamPickerProps) {

	return (
		<>
			{value.map((selected, slot) => {
				const other = value[1 - slot];

				return (
					<div key={slot} className="contents">
						<label htmlFor={`team-${slot}`} className="text-lg mb-2">
							Team {slot + 1}:
						</label>
						<select
							id={`team-${slot}`}
							value={selected}
							required
							disabled={disabled}
							onChange={e => {
								const next: TeamSlots = [...value];
								next[slot] = e.target.value;
								onChange(next);
							}}
							className="purple-input-box disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="">Select a Team</option>
							{teams
								.filter(team => (team.is_active || String(team.team_id) === selected) && String(team.team_id) !== other)
								.map(team => (
									<option key={team.team_id} value={team.team_id}>{team.team_name}</option>
								))}
						</select>
					</div>
				);
			})}
		</>
	);
}

export default MatchTeamPicker;
