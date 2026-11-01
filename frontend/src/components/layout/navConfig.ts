import type { NavIconName } from "./NavIcon";

export type NavItem = {
	label: string,
	path: string,
	icon: NavIconName
};

export type NavGroup = {
	title: string,
	items: NavItem[]
};

// Grouped so new sections (Standings, Roles) have an obvious home
export const NAV_GROUPS: NavGroup[] = [
	{
		title: "Competition",
		items: [
			{ label: "Dashboard", path: "/dashboard", icon: "dashboard" },
			{ label: "Events", path: "/events", icon: "events" },
			{ label: "Matches", path: "/sessions", icon: "matches" },
			{ label: "Standings", path: "/standings", icon: "standings" },
		]
	},
	{
		title: "People",
		items: [
			{ label: "Teams", path: "/teams", icon: "teams" },
			{ label: "Members", path: "/members", icon: "members" },
			{ label: "Users", path: "/users", icon: "users" },
		]
	}
];
