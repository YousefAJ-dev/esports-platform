import { NavLink } from "react-router";
import { useAuth } from "../../context/authContext";
import NavIcon from "./NavIcon";
import { visibleNavGroups } from "./navConfig";

type SidebarProps = {
	collapsed: boolean,
	mobileOpen: boolean,
	onToggleCollapsed: () => void,
	onCloseMobile: () => void
};

type NavContentProps = {
	collapsed: boolean,
	onNavigate?: () => void
};

function NavContent({ collapsed, onNavigate }: NavContentProps) {

	// Visitors only see the tournament pages; Users is Admin-only
	const { user } = useAuth();

	return (
		<nav className="flex-1 overflow-y-auto px-3 py-4">
			{visibleNavGroups(user).map(group => (
				<div key={group.title} className="mb-6">
					{/* Group titles become a thin divider when the rail is collapsed */}
					{collapsed
						? <div className="mx-3 mb-3 border-t border-slate-800" />
						: <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{group.title}</p>}

					<ul className="m-0 flex list-none flex-col gap-1 p-0">
						{group.items.map(item => (
							<li key={item.path}>
								<NavLink
									to={item.path}
									onClick={onNavigate}
									title={collapsed ? item.label : undefined}
									className={({ isActive }) =>
										`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${collapsed ? "justify-center" : ""} ${isActive
											? "bg-purple-700/40 text-white ring-1 ring-purple-400/30"
											: "text-slate-400 hover:bg-slate-800/70 hover:text-white"}`
									}
								>
									<NavIcon name={item.icon} />
									{!collapsed && <span>{item.label}</span>}
								</NavLink>
							</li>
						))}
					</ul>
				</div>
			))}
		</nav>
	);
}

function Brand({ collapsed }: { collapsed: boolean }) {

	return (
		<div className={`flex h-16 shrink-0 items-center gap-3 border-b border-slate-800 px-5 ${collapsed ? "justify-center px-0" : ""}`}>
			<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 font-bold text-white">A</span>
			{!collapsed && (
				<div className="leading-tight">
					<p className="font-semibold text-white">Arena Admin</p>
					<p className="text-xs text-slate-500">Tournament manager</p>
				</div>
			)}
		</div>
	);
}

function Sidebar({ collapsed, mobileOpen, onToggleCollapsed, onCloseMobile }: SidebarProps) {

	return (
		<>
			{/* Desktop: sticky rail that collapses to icons */}
			<aside className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-800 bg-slate-950 transition-[width] duration-200 md:flex ${collapsed ? "w-20" : "w-64"}`}>
				<Brand collapsed={collapsed} />
				<NavContent collapsed={collapsed} />
				<button
					type="button"
					onClick={onToggleCollapsed}
					aria-label={collapsed ? "Expand menu" : "Collapse menu"}
					className={`m-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-800/70 hover:text-white ${collapsed ? "justify-center" : ""}`}
				>
					<NavIcon name="collapse" className={`h-5 w-5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
					{!collapsed && <span>Collapse</span>}
				</button>
			</aside>

			{/* Mobile: slide-out drawer over a backdrop */}
			{mobileOpen && (
				<div className="fixed inset-0 z-40 md:hidden">
					<button type="button" aria-label="Close menu" onClick={onCloseMobile} className="absolute inset-0 bg-black/60" />
					<aside className="relative flex h-full w-72 flex-col border-r border-slate-800 bg-slate-950 shadow-2xl">
						<Brand collapsed={false} />
						<NavContent collapsed={false} onNavigate={onCloseMobile} />
					</aside>
				</div>
			)}
		</>
	);
}

export default Sidebar;
