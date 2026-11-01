import { useMemo } from "react";
import type { Crumb } from "../../types/navigation";
import type { EventMatch } from "../../types/sessions";
import MatchCard from "./MatchCard";

type EventBracketProps = {
	matches: EventMatch[],
	trail: Crumb[]
};

// One column per round, left to right. The API already sorts by round,
// so a single pass into a Map keeps the rounds in order - O(n).
export function EventBracket({ matches, trail }: EventBracketProps) {

	const rounds = useMemo(() => {
		const grouped = new Map<string, EventMatch[]>();

		for (const match of matches) {
			const round = grouped.get(match.session_type);
			if (round) {
				round.push(match);
			} else {
				grouped.set(match.session_type, [match]);
			}
		}

		return [...grouped.entries()];
	}, [matches]);

	if (rounds.length === 0) {
		return (
			<div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
				No matches scheduled yet.
			</div>
		);
	}

	return (
		<div className="flex gap-6 overflow-x-auto pb-4">
			{rounds.map(([round, roundMatches]) => (
				<div key={round} className="flex w-64 shrink-0 flex-col gap-4">
					<h3 className="text-lg font-semibold text-purple-300">{round}</h3>
					{/* Columns stretch to the tallest round, so spacing the matches out
					    makes later rounds sit between the matches that feed them */}
					<div className="flex flex-1 flex-col justify-around gap-4">
						{roundMatches.map(match => (
							<MatchCard key={match.session_id} match={match} trail={trail} />
						))}
					</div>
				</div>
			))}
		</div>
	);
}

export default EventBracket;
