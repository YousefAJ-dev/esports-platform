import { useLocation } from "react-router";
import type { Crumb, TrailState } from "../types/navigation";

// Works out the breadcrumb trail for the current page.
// If the user clicked through from a linked page, that page's trail arrives in router state;
// otherwise (direct URL, sidebar, refresh) the page's own fallback is used.
// childTrail is what this page should pass on to anything it links to.
export function useBreadcrumbTrail(fallback: Crumb[], currentLabel: string) {

	const location = useLocation();
	const state = location.state as TrailState | null;

	const trail = state?.trail ?? fallback;
	const childTrail: Crumb[] = [...trail, { label: currentLabel, to: location.pathname }];

	return { trail, childTrail };
}
