import { useLocation } from "react-router";
import NavIcon from "./NavIcon";
import { NAV_GROUPS } from "./navConfig";

type TopBarProps = {
	onOpenMenu: () => void
};

// Labels keyed by the first URL segment, built once from the nav config
const SECTION_LABELS = new Map(
	NAV_GROUPS.flatMap(group => group.items).map(item => [item.path.slice(1), item.label])
);

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

			{/* Placeholder until login exists - this becomes the account menu */}
			<button
				type="button"
				className="flex items-center gap-2 rounded-full border border-slate-700 py-1 pl-1 pr-3 text-sm text-slate-300 transition hover:border-purple-600 hover:text-white"
			>
				<span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-700 text-xs font-semibold text-white">AD</span>
				Admin
			</button>
		</header>
	);
}

export default TopBar;
