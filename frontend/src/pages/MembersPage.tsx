import StatCard from "../components/ui/StatCard";

function DashboardPage (){

	const pageStats = [
		{ title: 'Real Name', value: "Lee Sang-hyeok" }, 
		{ title: 'Display Name', value: "Faker" },
		{ title: 'Current Team Name', value: "Apex Competitors" },
		{ title: 'Age', value: 30 },
		{ title: 'Team Position', value: "Player" },
		{ title: 'Member Activity', value: true },
		{ title: 'Matches Played with Current Team', value: 1 },
		{ title: 'Events Participated with Current Team', value: 1 }
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
				<p className="text-4xl">Member</p>
				<p className="text-xl">An overview of a member that belongs to this platform</p>
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