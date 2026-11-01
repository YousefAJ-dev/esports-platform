type StatusPillProps = {
	status: string
};

// One color per status so state can be read at a glance; unknown values fall back to purple
const STATUS_STYLES: Record<string, string> = {
	"Upcoming": "border-sky-800/60 bg-sky-950/50 text-sky-200",
	"In-Progress": "border-amber-700/60 bg-amber-950/50 text-amber-200",
	"Completed": "border-emerald-800/60 bg-emerald-950/50 text-emerald-200",
	"Cancelled": "border-rose-900/60 bg-rose-950/40 text-rose-300",
	"Active": "border-emerald-800/60 bg-emerald-950/50 text-emerald-200",
	"Inactive": "border-slate-700 bg-slate-800/60 text-slate-400",
};

export function StatusPill({ status }: StatusPillProps) {

	const style = STATUS_STYLES[status] ?? "border-purple-800/60 bg-purple-950/50 text-purple-200";

	return (
		<span className={`status-pill ${style}`}>
			{/* Pulsing dot marks matches/events that are live right now */}
			{status === "In-Progress" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />}
			{status}
		</span>
	);
}

export default StatusPill;
