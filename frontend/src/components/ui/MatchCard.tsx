import { Link } from "react-router";
import { convertDate } from "../../helper/helperFunctions";
import type { Crumb } from "../../types/navigation";
import type { EventMatch } from "../../types/sessions";
import StatusPill from "./StatusPill";

type MatchCardProps = {
	match: EventMatch,
	trail: Crumb[],
	showRound?: boolean,
	// On the all-matches list the card also names its event and round
	showEvent?: boolean
};

// Compact clickable match: each team with its score, winner highlighted
export function MatchCard({ match, trail, showRound = false, showEvent = false }: MatchCardProps) {

	return (
		<Link
			to={`/sessions/${match.session_id}`}
			state={{ trail }}
			className="stat-card stat-card-clickable"
		>
			<div className="stat-card-header">
				<p className="stat-id">
					{showRound ? match.session_type : `Match #${match.session_id}`}
				</p>
				<StatusPill status={match.status} />
			</div>

			{showEvent && (
				<div className="mt-2">
					<p className="font-semibold text-white">{match.event_name}</p>
					<p className="light-text">{match.session_type}</p>
				</div>
			)}

			<div className="mt-3 space-y-2">
				{match.teams.length === 0 ? (
					<p className="text-slate-500">Teams TBD</p>
				) : (
					match.teams.map(team => (
						<div
							key={team.team_id}
							className={`flex items-center justify-between rounded-lg px-3 py-1 ${team.is_winner ? "bg-purple-950/60 text-purple-100 font-semibold" : "text-slate-200"}`}
						>
							<span className="flex items-center gap-2">
								{team.team_name}
								{team.is_winner && <span className="status-pill">W</span>}
							</span>
							<span className="tabular-nums">{team.score ?? "–"}</span>
						</div>
					))
				)}
			</div>

			<p className="mt-3 text-sm text-slate-500">{convertDate(match.scheduled_start)}</p>
		</Link>
	);
}

export default MatchCard;
