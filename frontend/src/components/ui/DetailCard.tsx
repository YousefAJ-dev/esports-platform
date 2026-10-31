import type { StatCardProps } from "../../types/statCardProps";

type DetailCardProps = StatCardProps & {
	highlight?: boolean
};

// Label/value card used on details pages (same look as the session details cards).
// highlight switches to the purple variant for key fields like status.
export function DetailCard({ title, value, highlight = false }: DetailCardProps) {

	const displayValue =
		typeof value === "boolean"
			? value ? "Active" : "Inactive"
			: value ?? "N/A";

	return (
		<div className={highlight ? "stat-card-purple" : "stat-card"}>
			<p className={highlight ? "light-purple-text" : "light-text"}>{title}</p>
			<p className={highlight ? "lighter-purple-text" : "value-text"}>{displayValue}</p>
		</div>
	);
}

export default DetailCard;
