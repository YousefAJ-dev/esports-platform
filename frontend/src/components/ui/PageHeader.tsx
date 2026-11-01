import { Link } from "react-router";

type PageHeaderProps = {
	title: string,
	description: string,
	count?: number,
	action?: { label: string, to: string }
};

// List page heading: title with a small count badge, a description and the main action
export function PageHeader({ title, description, count, action }: PageHeaderProps) {

	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h1 className="flex items-center gap-3 text-3xl font-bold text-white">
					{title}
					{count !== undefined && (
						<span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-sm font-medium text-slate-300">{count}</span>
					)}
				</h1>
				<p className="mt-1 text-slate-400">{description}</p>
			</div>

			{action && (
				<Link to={action.to} className="green-btn green-btn-clickable self-start sm:self-auto">
					{action.label}
				</Link>
			)}
		</div>
	);
}

export default PageHeader;
