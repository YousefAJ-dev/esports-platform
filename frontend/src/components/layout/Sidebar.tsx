import { NavLink } from "react-router";

type sidebarItem = {
	label: string,
	path: string
};

function Sidebar() {

	const pages: sidebarItem[] = [
		{ label: 'Dashboard', path: '/dashboard' },
		{ label: 'Events', path: '/events' },
		{ label: 'Sessions', path: '/sessions' },
		{ label: 'Teams', path: '/teams' },
		{ label: 'Members', path: '/members' },
		{ label: 'Users', path: '/users' }
	];

	//className = " bg-slate-700 rounded-sm p-2 shadow-xl/20 my-2 hover:bg-slate-800 hover:scale-105"

	return (
		<aside className="flex flex-col min-h-full  bg-gray-500">

			<h1 className="p-6">Admin Menu</h1>

			<nav className="flex flex-col p-4 items-start w-64 list-none">
				{pages.map(page =>
					<li id={page.path} className="my-4">
						<NavLink to={page.path} 
						className = {({isActive}) => 
						isActive
							? "block rounded-md bg-slate-800 px-3 py-2 text-white"
							: "block bg-slate-700 rounded-md px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white hover:scale-105 hover:cursor-pointer"
						}>
							{page.label}
						</NavLink>
					</li>)
				}
			</nav>
		</aside>
	)
}

export default Sidebar;