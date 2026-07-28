import StatCard from "../components/ui/StatCard";

function DashboardPage (){

	const pageStats = [
		{ title: 'Real Name', value: "Leonardo DaVinci" }, 
		{ title: 'Username', value: "TM1LDaVinci" },
		{ title: 'Role Name', value: "Team Manager" },
		{ title: 'Email', value: "MrLisa@artist.com" },
		{ title: 'Manages', value: null },
		{ title: 'User Activity', value: true }
	]

	const pageStatItems = pageStats.map(stat => (
		<StatCard 
			key={stat.title}
			title={stat.title}
			value={stat.value}
		/>));

	return(
		<section className="min-h-screen flex flex-col items-center bg-slate-800">
			<div className="flex-1 py-15">
				<p className="text-4xl">Users</p>
				<p className="text-xl">An overview of users that belong to this platfor</p>
			</div>
			<main  className="flex-3">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{pageStatItems}
				</div>
			</main>
		</section>
	)
}

export default DashboardPage;