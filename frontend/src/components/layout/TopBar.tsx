function TopBar() {
	
	return (
	<>
		<section className="flex px-3 py-6 bg-slate-900 gap-4 items-center">
			<div className="flex-4">
				<p className="text-3xl">
					Page title
				</p>
				<p className="text-xl">
					subtitle info
				</p>
			</div>
			<input className="flex-3 rounded-4xl h-10 px-4 border" type="search" placeholder="search"></input>
			<button type="button" className="flex-1">User Profile</button>
		</section>
	</>
	)
}

export default TopBar;