import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";

export type Column<T> = {
	header: string,
	render: (item: T) => ReactNode,
	// e.g. "hidden md:table-cell" to drop a column on small screens
	className?: string
};

type DataTableProps<T> = {
	items: T[],
	columns: Column<T>[],
	getKey: (item: T) => number | string,
	getLink: (item: T) => string
};

// Dense list for people-style records. The whole row is clickable; the first cell is a
// real link so keyboard and screen reader users can still reach each record.
export function DataTable<T>({ items, columns, getKey, getLink }: DataTableProps<T>) {

	const navigate = useNavigate();

	return (
		<div className="overflow-x-auto rounded-xl border border-slate-800">
			<table className="w-full text-left text-sm">
				<thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-500">
					<tr>
						{columns.map(column => (
							<th key={column.header} scope="col" className={`px-4 py-3 font-semibold ${column.className ?? ""}`}>
								{column.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="divide-y divide-slate-800">
					{items.map(item => (
						<tr
							key={getKey(item)}
							onClick={() => navigate(getLink(item))}
							className="cursor-pointer bg-slate-950 transition hover:bg-slate-900"
						>
							{columns.map((column, index) => (
								<td key={column.header} className={`px-4 py-3 text-slate-300 ${column.className ?? ""}`}>
									{index === 0
										? <Link to={getLink(item)} onClick={e => e.stopPropagation()} className="font-medium text-white hover:text-purple-300">{column.render(item)}</Link>
										: column.render(item)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default DataTable;
