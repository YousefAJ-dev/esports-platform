import StatCard from "../components/ui/StatCard";

function DashboardPage (){

	const pageStats = [
		{ title: 'Total Events', value: 4 }, 
		{ title: 'Total Upcoming Events', value: 2 },
		{ title: 'Total Teams', value: 20 },
		{ title: 'Total Members', value: 60 },
		{ title: 'Total Active Members', value: 60 },
		{ title: 'Total Sessions', value: 20 },
		{ title: 'Total Active Managers', value: 10 }
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
				<p className="text-4xl">Dashboard</p>
				<p className="text-xl">An Dashboard of the most relevant information that belong to this platform</p>
			</div>
			<main  className="flex-3">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
					{pageStatItems}
				</div>
			</main>
		</section>
	)
}

export default DashboardPage;