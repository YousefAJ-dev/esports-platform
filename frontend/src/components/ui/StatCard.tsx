import type { StatCardProps } from "../../types/StatCardProps";

function StatCard ( props : StatCardProps ) {

	const displayValue = 
		typeof props.value === 'boolean'
			? props.value ? "Active" : "Inactive"
		: props.value;

	return(
		<div className="border-3 border-black rounded-md bg-gray-600 p-4 hover:bg-gray-700">
			<p>{props.title}:</p>
			<p>{displayValue ?? 'N/A'}</p>
		</div>
	);

}

export default StatCard;