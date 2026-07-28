import StatCard from "../components/ui/StatCard";

function SessionsPage (){

	const pageStats = [
		{ title: 'Event Name', value: "Fall Open 2026" }, 
		{ title: 'Match Bracket', value: "Final" },
		{ title: 'Scheduled Start', value: "2026-09-12 11pm CST" },
		{ title: 'scheduled_end', value: "2026-09-13T02:00:00.000Z" },
		{ title: 'Player Count For Team 1', value: "Chameleons" },
		{ title: 'Team Name For Team 1', value: "Morgan Freeman" },
		{ title: 'Manager Name For Team 1', value: 6 },
		{ title: 'Player Count For Team 2', value: "Super Musicians" },
		{ title: 'Team Name For Team 2', value: "Wolfgang Mozart" },
		{ title: 'Manager Name For Team 2', value: 6 }
	]

	const pageStatItems = pageStats.map(stat => (
		<StatCard 
			key={stat.title}
			title={stat.title}
			value={stat.value}
		/>));

	return(
		<section className="min-h-screen flex flex-col items-center bg-slate-800 px-10">
			<div className="flex-1 py-15">
				<p className="text-4xl">Sessions</p>
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

export default SessionsPage;