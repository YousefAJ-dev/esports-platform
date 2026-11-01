import { Link } from "react-router";
import { convertDate } from "../../helper/helperFunctions";
import type { EventMatch } from "../../types/sessions";

type MatchRowProps = {
	match: EventMatch
};

// One-line match for dense lists: "Team A 2 - 1 Team B" once scored, "Team A vs Team B" before
export function MatchRow({ match }: MatchRowProps) {

	const [home, away] = match.teams;
	const hasScore = match.teams.some(team => team.score !== null);

	const teamClass = (isWinner: boolean | undefined) => isWinner ? "font-semibold text-purple-200" : "text-slate-200";

	return (
		<Link
			to={`/sessions/${match.session_id}`}
			className="flex items-center justify-between gap-4 rounded-lg px-3 py-3 transition hover:bg-slate-800/70"
		>
			<div className="min-w-0">
				{home && away ? (
					<p className="truncate">
						<span className={teamClass(home.is_winner)}>{home.team_name}</span>
						<span className="mx-2 tabular-nums text-slate-400">
							{hasScore ? `${home.score ?? 0} - ${away.score ?? 0}` : "vs"}
						</span>
						<span className={teamClass(away.is_winner)}>{away.team_name}</span>
					</p>
				) : (
					<p className="text-slate-500">Teams TBD</p>
				)}
				<p className="truncate text-xs text-slate-500">{match.event_name} · {match.session_type}</p>
			</div>

			<p className="shrink-0 text-right text-xs text-slate-400">{convertDate(match.scheduled_start)}</p>
		</Link>
	);
}

export default MatchRow;
