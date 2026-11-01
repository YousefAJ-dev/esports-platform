import { Link } from "react-router";
import type { Crumb } from "../../types/navigation";

type BreadcrumbsProps = {
	trail: Crumb[],
	current: string
};

// Events / Spring Cup / Semi-Final / Apex - every crumb but the last is a link back
export function Breadcrumbs({ trail, current }: BreadcrumbsProps) {

	return (
		<nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
			{trail.map((crumb, index) => (
				<span key={`${crumb.to}-${index}`} className="flex items-center gap-2">
					<Link
						to={crumb.to}
						// Hand the trail up to this crumb back, so its own breadcrumbs stay intact
						state={{ trail: trail.slice(0, index) }}
						className="hover:text-purple-300"
					>
						{crumb.label}
					</Link>
					<span className="text-slate-600">/</span>
				</span>
			))}
			<span className="font-medium text-purple-300">{current}</span>
		</nav>
	);
}

export default Breadcrumbs;
