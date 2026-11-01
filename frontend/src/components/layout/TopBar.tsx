import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../context/authContext";
import NavIcon from "./NavIcon";
import { NAV_GROUPS } from "./navConfig";

type TopBarProps = {
	onOpenMenu: () => void
};

// Labels keyed by the first URL segment, built once from the nav config
const SECTION_LABELS = new Map(
	NAV_GROUPS.flatMap(group => group.items).map(item => [item.path.slice(1), item.label])
);

// Account button and dropdown: who you are, your roles, and log out
function AccountMenu() {

	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Close when clicking anywhere outside the menu
	useEffect(() => {
		if (!isOpen) return;

		const handleClick = (e: MouseEvent) => {
			if (!menuRef.current?.contains(e.target as Node)) setIsOpen(false);
		};

		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [isOpen]);

	// Visitors get a sign-in link that brings them back to this page afterwards
	if (!user) {
		const next = encodeURIComponent(location.pathname + location.search);
		return <Link to={`/login?next=${next}`} className="green-btn green-btn-clickable text-sm">Sign in</Link>;
	}

	const initials = `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase();

	const handleLogout = async () => {
		setIsOpen(false);
		await logout();
		navigate("/dashboard");
	};

	return (
		<div ref={menuRef} className="relative">
			<button
				type="button"
				onClick={() => setIsOpen(open => !open)}
				aria-expanded={isOpen}
				aria-haspopup="menu"
				className="flex items-center gap-2 rounded-full border border-slate-700 py-1 pl-1 pr-3 text-sm text-slate-300 transition hover:border-purple-600 hover:text-white"
			>
				<span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-700 text-xs font-semibold text-white">{initials}</span>
				<span className="hidden sm:inline">{user.first_name}</span>
			</button>

			{isOpen && (
				<div role="menu" className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-2xl">
					<p className="font-semibold text-white">{user.first_name} {user.last_name}</p>
					<p className="text-sm text-slate-500">@{user.username}</p>

					<div className="mt-3 flex flex-wrap gap-1.5">
						{user.roles.length === 0
							? <span className="text-xs text-slate-500">No roles assigned</span>
							: user.roles.map(role => <span key={role} className="status-pill">{role}</span>)}
					</div>

					<button
						type="button"
						role="menuitem"
						onClick={handleLogout}
						className="mt-4 w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-rose-700 hover:text-rose-200"
					>
						Log out
					</button>
				</div>
			)}
		</div>
	);
}

function TopBar({ onOpenMenu }: TopBarProps) {

	const { pathname } = useLocation();
	const section = SECTION_LABELS.get(pathname.split("/")[1]) ?? "Arena Admin";

	return (
		<header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur md:px-6">
			<button
				type="button"
				onClick={onOpenMenu}
				aria-label="Open menu"
				className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
			>
				<NavIcon name="menu" />
			</button>

			<p className="flex-1 text-lg font-semibold text-white">{section}</p>

			<AccountMenu />
		</header>
	);
}

export default TopBar;
