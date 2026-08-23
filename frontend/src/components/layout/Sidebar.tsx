import { NavLink } from "react-router";

type sidebarItem = {
	label: string,
	path: string
};

function Sidebar() {

	const pages: sidebarItem[] = [
		{ label: 'Dashboard', path: '/dashboard'},
		{ label: 'Events', path: '/events' },
		{ label: 'Matches', path: '/sessions' },
		{ label: 'Teams', path: '/teams' },
		{ label: 'Members', path: '/members' },
		{ label: 'Users', path: '/users' }
	];

	return (
	<aside className="min-h-screen w-64 shrink-0 border-r border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
		<div className="border-b border-purple-800/40 p-6">
			<h1 className="text-xl font-bold text-white">
				Admin Menu
			</h1>

			<p className="mt-1 text-sm text-purple-300">
				Arena Admin
			</p>
		</div>

		<nav className="p-4">
			<ul className="flex list-none flex-col gap-2 p-0 m-0">
				{pages.map((page) => (
					<li key={page.path}>
						<NavLink
							to={page.path}
							className={({ isActive }) =>
								isActive
									? "block rounded-lg border border-purple-300/30 bg-purple-700/50 px-4 py-3 text-white"
									: "block rounded-lg px-4 py-3 text-slate-300 transition hover:translate-x-1 hover:bg-purple-900/40 hover:text-white"
							}
						>
							{page.label}
						</NavLink>
					</li>
				))}
			</ul>
		</nav>
	</aside>
);
}

export default Sidebar;