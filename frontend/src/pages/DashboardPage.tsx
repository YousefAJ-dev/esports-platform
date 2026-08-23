import { useEffect, useState } from "react";
import StatCard from "../components/ui/StatCard";
import type { DashboardSummary } from "../types/dashboard";
import { getDashboard } from "../api/dashboardApi";


function DashboardPage() {

	const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function loadDashboard() {
			try {

				const data = await getDashboard();
				console.log(data);
				setDashboard(data);

			} catch {

				setError('Failed to load dashboard data');

			} finally {
				setIsLoading(false)
			}
		}

		loadDashboard();
	}, []);

	if (isLoading) {
		return <p>Loading Dashboard...</p>
	}

	if (error) {
		return <p>{error}</p>
	}

	if (!dashboard) {
		return <p>No dashboard data was found</p>
	}

	const pageStats = [
		{ title: 'Total Events', value: dashboard.total_events },
		{ title: 'Total Upcoming Events', value: dashboard.total_upcoming_events },
		{ title: 'Total Teams', value: dashboard.total_teams },
		{ title: 'Total Members', value: dashboard.total_members },
		{ title: 'Total Active Members', value: dashboard.total_active_members },
		{ title: 'Total Sessions', value: dashboard.total_sessions },
		{ title: 'Total Upcoming Sessions', value: dashboard.total_upcoming_sessions },
		{ title: 'Total Completed Sessions', value: dashboard.total_completed_sessions },
		{ title: 'Total Active Managers', value: dashboard.total_active_managers }
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
					<h1 className="stat-title">Dashboard Summary</h1>
					<p className="text-xl">An Dashboard of the most relevant information that belong to this platform</p>
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