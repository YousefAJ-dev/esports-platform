import StatCard from "../components/ui/StatCard";
import { getDashboard } from "../api/dashboardApi";
import StatusMessage from "../components/ui/StatusMessage";
import { useAsyncData } from "../hooks/useAsyncData";


function DashboardPage() {

	const { data: dashboard, errorMsg, isLoading } = useAsyncData(getDashboard, "Failed to load dashboard data", "dashboard");

	if (isLoading || errorMsg || !dashboard) {
		return <StatusMessage isLoading={isLoading} errorMsg={errorMsg} loadingText="Loading dashboard..." />;
	}

	const pageStats = [
		{ title: 'Total Events', value: dashboard.total_events },
		{ title: 'Upcoming Events', value: dashboard.total_upcoming_events },
		{ title: 'Total Teams', value: dashboard.total_teams },
		{ title: 'Total Members', value: dashboard.total_members },
		{ title: 'Active Members', value: dashboard.total_active_members },
		{ title: 'Total Matches', value: dashboard.total_sessions },
		{ title: 'Upcoming Matches', value: dashboard.total_upcoming_sessions },
		{ title: 'Completed Matches', value: dashboard.total_completed_sessions },
		{ title: 'Active Managers', value: dashboard.total_active_managers }
	];

	const pageStatItems = pageStats.map(stat => (
		<StatCard
			key={stat.title}
			title={stat.title}
			value={stat.value}
		/>));

	return (
		<section className="main-content-layout">
			<div className="mx-auto max-w-7xl space-y-8">
				<div className="header-box">
					<p className="text-sm font-medium text-purple-300">Dashboard</p>
					<h1 className="header-text">Dashboard Summary</h1>
					<p className="mt-2 text-slate-400">A snapshot of events, matches, teams and members across the platform.</p>
				</div>
				<main className="flex-3">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
						{pageStatItems}
					</div>
				</main>
			</div>
		</section>
	)
}

export default DashboardPage;