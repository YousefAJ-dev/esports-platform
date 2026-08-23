import type { StatCardProps } from "../../types/statCardProps";

function StatCard(props: StatCardProps) {

	const displayValue =
		typeof props.value === 'boolean'
			? props.value ? "Active" : "Inactive"
			: props.value;

	return (
		<div className="stat-card">
			<p className="stat-id text-xl">{props.title}</p>
			<p className="mt-1 text-3xl font-bold text-white">{displayValue ?? 'N/A'}</p>
		</div>
	);

}

export default StatCard;