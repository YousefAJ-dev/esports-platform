import type { AuthUser } from "../../types/auth";
import { canCreateTeam, isAdmin } from "../../helper/permissions";
import type { NavIconName } from "./NavIcon";

// Who sees a link: everyone, anyone logged in, or Admins only (matches the route guards in App.tsx)
export type NavAccess = "public" | "login" | "admin";

export type NavItem = {
	label: string,
	path: string,
	icon: NavIconName,
	access: NavAccess
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
			{ label: "Dashboard", path: "/dashboard", icon: "dashboard", access: "public" },
			{ label: "Events", path: "/events", icon: "events", access: "public" },
			{ label: "Matches", path: "/sessions", icon: "matches", access: "public" },
			{ label: "Standings", path: "/standings", icon: "standings", access: "public" },
		]
	},
	{
		title: "People",
		items: [
			{ label: "Teams", path: "/teams", icon: "teams", access: "login" },
			{ label: "Members", path: "/members", icon: "members", access: "login" },
			{ label: "Users", path: "/users", icon: "users", access: "admin" },
		]
	}
];

const canSee = (user: AuthUser | null, access: NavAccess) =>
	access === "public" || (access === "login" && Boolean(user)) || (access === "admin" && isAdmin(user));

// The links this person should see. Team Managers also get a shortcut to their team,
// or to creating one if they don't have a team yet. Empty groups are dropped.
export function visibleNavGroups(user: AuthUser | null): NavGroup[] {

	const groups = NAV_GROUPS
		.map(group => ({ ...group, items: group.items.filter(item => canSee(user, item.access)) }))
		.filter(group => group.items.length > 0);

	const myTeam: NavItem | null = user?.managed_team_id
		? { label: "My Team", path: `/teams/${user.managed_team_id}`, icon: "teams", access: "login" }
		: user?.roles.includes("Team Manager") && canCreateTeam(user)
			? { label: "Create your team", path: "/teams/new", icon: "teams", access: "login" }
			: null;

	if (!myTeam) return groups;

	return [{ title: "My Team", items: [myTeam] }, ...groups];
}
