import { useMemo, useState } from "react";

export type SortOption<T> = {
	label: string,
	compare: (a: T, b: T) => number
};

type FilterConfig<T> = {
	// Text the search box matches against (name, email, ...)
	searchText: (item: T) => string,
	// Optional status for the filter chips
	getStatus?: (item: T) => string,
	// Chip order; statuses not listed are appended
	statusOrder?: string[],
	sorts: SortOption<T>[]
};

// Client-side search, status filter and sort for list pages.
// Search text is lowercased once per list, so each keystroke is a single O(n) pass plus the sort.
export function useFilteredList<T>(items: T[], { searchText, getStatus, statusOrder = [], sorts }: FilterConfig<T>) {

	const [query, setQuery] = useState("");
	const [status, setStatus] = useState<string | null>(null);
	const [sortIndex, setSortIndex] = useState(0);

	// Config callbacks are inline per render, so only the items should rebuild the index
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const indexed = useMemo(() => items.map(item => ({ item, text: searchText(item).toLowerCase() })), [items]);

	// Chip counts come from the full list so they don't jump around while typing
	const statusCounts = useMemo(() => {
		const counts = new Map<string, number>(statusOrder.map(name => [name, 0]));
		if (!getStatus) return counts;

		for (const item of items) {
			const name = getStatus(item);
			counts.set(name, (counts.get(name) ?? 0) + 1);
		}
		return counts;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [items]);

	const results = useMemo(() => {
		const needle = query.trim().toLowerCase();

		const matched = indexed
			.filter(entry => (!needle || entry.text.includes(needle)) && (!status || getStatus?.(entry.item) === status))
			.map(entry => entry.item);

		return matched.sort(sorts[sortIndex].compare);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [indexed, query, status, sortIndex]);

	return {
		query, setQuery,
		status, setStatus,
		sortIndex, setSortIndex,
		sortLabels: sorts.map(sort => sort.label),
		statusCounts: getStatus ? statusCounts : null,
		results,
		total: items.length
	};
}

// Comparators shared by the list pages
export const byText = <T,>(get: (item: T) => string) => (a: T, b: T) => get(a).localeCompare(get(b));
export const byDate = <T,>(get: (item: T) => string, direction: 1 | -1 = 1) =>
	(a: T, b: T) => direction * (new Date(get(a)).getTime() - new Date(get(b)).getTime());
