import { Link } from "react-router";
import type { Crumb } from "../../types/navigation";
import type { Standing } from "../../types/standings";
import { useAuth } from "../../context/authContext";

type StandingsTableProps = {
	standings: Standing[],
	trail?: Crumb[]
};

const formatDiff = (diff: number) => diff > 0 ? `+${diff}` : String(diff);

// Rows arrive ranked from the API (wins, then score difference)
export function StandingsTable({ standings, trail }: StandingsTableProps) {

	// Team pages need a login, so visitors see names without links
	const { user } = useAuth();

	if (standings.length === 0) {
		return <div className="stat-card text-slate-400">No teams to rank yet.</div>;
	}

	return (
		<div className="overflow-x-auto rounded-xl border border-slate-800">
			<table className="w-full text-left text-sm">
				<thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-500">
					<tr>
						<th scope="col" className="w-12 px-4 py-3 font-semibold">#</th>
						<th scope="col" className="px-4 py-3 font-semibold">Team</th>
						<th scope="col" className="px-3 py-3 text-right font-semibold" title="Played">P</th>
						<th scope="col" className="px-3 py-3 text-right font-semibold" title="Wins">W</th>
						<th scope="col" className="px-3 py-3 text-right font-semibold" title="Losses">L</th>
						<th scope="col" className="hidden px-3 py-3 text-right font-semibold sm:table-cell" title="Draws">D</th>
						<th scope="col" className="hidden px-3 py-3 text-right font-semibold sm:table-cell" title="Score for - against">Score</th>
						<th scope="col" className="px-3 py-3 text-right font-semibold" title="Score difference">+/-</th>
						<th scope="col" className="hidden px-4 py-3 text-right font-semibold md:table-cell">Win %</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-slate-800 tabular-nums">
					{standings.map((row, index) => {
						const diff = row.score_for - row.score_against;
						const winRate = row.played ? Math.round((row.wins / row.played) * 100) : null;

						return (
							<tr key={row.team_id} className="bg-slate-950 transition hover:bg-slate-900">
								{/* Top three get a highlighted rank */}
								<td className={`px-4 py-3 font-semibold ${index < 3 && row.played ? "text-purple-300" : "text-slate-500"}`}>{index + 1}</td>
								<td className="px-4 py-3">
									{user ? (
										<Link to={`/teams/${row.team_id}`} state={trail ? { trail } : undefined} className="font-medium text-white hover:text-purple-300">
											{row.team_name}
										</Link>
									) : (
										<span className="font-medium text-white">{row.team_name}</span>
									)}
									{!row.is_active && <span className="ml-2 text-xs text-slate-500">(inactive)</span>}
								</td>
								<td className="px-3 py-3 text-right text-slate-300">{row.played}</td>
								<td className="px-3 py-3 text-right font-semibold text-emerald-300">{row.wins}</td>
								<td className="px-3 py-3 text-right text-rose-300">{row.losses}</td>
								<td className="hidden px-3 py-3 text-right text-slate-400 sm:table-cell">{row.draws}</td>
								<td className="hidden px-3 py-3 text-right text-slate-400 sm:table-cell">{row.score_for}-{row.score_against}</td>
								<td className={`px-3 py-3 text-right ${diff > 0 ? "text-emerald-300" : diff < 0 ? "text-rose-300" : "text-slate-400"}`}>{formatDiff(diff)}</td>
								<td className="hidden px-4 py-3 text-right text-slate-300 md:table-cell">{winRate === null ? "–" : `${winRate}%`}</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

export default StandingsTable;
