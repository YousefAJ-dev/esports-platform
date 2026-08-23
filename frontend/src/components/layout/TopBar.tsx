function TopBar() {
	
	return (
		<header className="flex items-center gap-4 border-b border-slate-800 bg-slate-900 px-6 py-4 text-slate-100">
			<div className="flex-1">
				<p className="text-2xl font-semibold text-white">
					Admin Access
				</p>
				<p className="text-sm text-slate-400">
					Manage platform activity
				</p>
			</div>

			<input
				className="hidden h-10 w-full max-w-md rounded-full border border-slate-700 bg-slate-950 px-4 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-900/60 md:block"
				type="search"
				placeholder="Search..."
			/>

			<button
				type="button"
				className="rounded-full border border-purple-700/60 bg-purple-900/40 px-4 py-2 text-sm font-medium text-purple-100 transition hover:bg-purple-800/60 hover:text-white"
			>
				User
			</button>
		</header>
	);
}

export default TopBar;