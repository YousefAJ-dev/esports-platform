import StatCard from "../components/ui/StatCard";

function EventsPage (){

	const pageStats = [
		{ title: 'Event ID', value: 1 }, 
		{ title: 'Number of Matches', value: 4 },
		{ title: 'Total Teams', value: 10 },
		{ title: 'Completed Matches', value: 2 },
		{ title: 'Matches in Progress', value: 1 },
		{ title: 'Upcoming Matches', value: 2 },
		{ title: 'Event Status', value: 'In-Progess' }
	]

	const pageStatItems = pageStats.map(stat => (
		<StatCard 
			key={stat.title}
			title={stat.title}
			value={stat.value}
		/>));

	return(
		<section className="px-10 min-h-screen flex flex-col items-center bg-slate-800">
			<div className="flex-1 py-15">
				<p className="text-4xl">Events</p>
				<p className="text-xl">An overview of events that belong to this platform</p>
			</div>
			<main  className="flex-3">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{pageStatItems}
				</div>
			</main>
		</section>
	)
}

export default EventsPage;