export type NavIconName = "dashboard" | "events" | "matches" | "standings" | "teams" | "members" | "users" | "menu" | "collapse";

// Inline outline icons (24px grid) so the nav needs no icon library
const PATHS: Record<NavIconName, string> = {
	dashboard: "M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z",
	events: "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
	matches: "M5 4l7 7M12 11l7-7M8 13l-4 4 3 3 4-4M16 13l4 4-3 3-4-4",
	standings: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4",
	teams: "M5 21V4M5 4h11l-2 4 2 4H5",
	members: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0",
	users: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 19a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 19a6 6 0 0 0-3-5.2",
	menu: "M4 6h16M4 12h16M4 18h16",
	collapse: "M15 6l-6 6 6 6",
};

type NavIconProps = {
	name: NavIconName,
	className?: string
};

export function NavIcon({ name, className = "h-5 w-5" }: NavIconProps) {

	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
			<path d={PATHS[name]} />
		</svg>
	);
}

export default NavIcon;
