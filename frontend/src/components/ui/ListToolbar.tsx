import type { useFilteredList } from "../../hooks/useFilteredList";

type ListToolbarProps = {
	list: ReturnType<typeof useFilteredList<unknown>>,
	placeholder: string
};

// Search box, status chips and sort for a list page; all state lives in useFilteredList
export function ListToolbar({ list, placeholder }: ListToolbarProps) {

	const { query, setQuery, status, setStatus, sortIndex, setSortIndex, sortLabels, statusCounts, results, total } = list;

	const chipClass = (active: boolean) =>
		`rounded-full border px-3 py-1 text-xs font-medium transition ${active
			? "border-purple-500 bg-purple-700/40 text-white"
			: "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"}`;

	return (
		<div className="space-y-3">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<input
					type="search"
					value={query}
					onChange={e => setQuery(e.target.value)}
					placeholder={placeholder}
					aria-label={placeholder}
					className="purple-input-box sm:max-w-sm"
				/>

				<label className="flex items-center gap-2 text-sm text-slate-400 sm:ml-auto">
					Sort
					<select
						value={sortIndex}
						onChange={e => setSortIndex(Number(e.target.value))}
						className="purple-input-box w-auto py-1.5"
					>
						{sortLabels.map((label, index) => <option key={label} value={index}>{label}</option>)}
					</select>
				</label>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				{statusCounts && (
					<>
						<button type="button" onClick={() => setStatus(null)} className={chipClass(status === null)}>
							All {total}
						</button>
						{[...statusCounts].map(([name, count]) => (
							<button key={name} type="button" onClick={() => setStatus(name)} className={chipClass(status === name)}>
								{name} {count}
							</button>
						))}
					</>
				)}
				{results.length !== total && (
					<p className="text-sm text-slate-500">Showing {results.length} of {total}</p>
				)}
			</div>
		</div>
	);
}

export default ListToolbar;
