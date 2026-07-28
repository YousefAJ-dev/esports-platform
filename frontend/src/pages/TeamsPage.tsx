import StatCard from "../components/ui/StatCard";

function TeamsPage (){

	const pageStats = [
		{ title: 'Team Name', value: "Super Musicians" }, 
		{ title: 'Team Contact Email', value: "musicians@arena.gg" },
		{ title: 'Team Activity', value: true },
		{ title: 'Manager Name', value: "Wolfgang Mozart" },
		{ title: 'Active Player Count', value: 6 },
		{ title: 'Captain Name', value: "Rihanna Fenty" },
		{ title: 'Captain Display Name', value: "Riri" },
		{ title: 'Total Matches', value: 4 },
		{ title: 'Matches Played', value: 2 },
		{ title: 'Matches In Progess', value: 0 },
		{ title: 'Upcoming Matches', value: 2 },
		{ title: 'Total Events Participated', value: 4 }
	]

	const pageStatItems = pageStats.map(stat => (
		<StatCard 
			key={stat.title}
			title={stat.title}
			value={stat.value}
		/>));

	return(
		<section className="min-h-screen px-10 flex flex-col items-center bg-slate-800">
			<div className="flex-1 py-15">
				<p className="text-4xl">Team</p>
				<p className="text-xl">An overview of sessions that belong to this platform</p>
			</div>
			<main  className="flex-3">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{pageStatItems}
				</div>
			</main>
		</section>
	)
}

export default TeamsPage;