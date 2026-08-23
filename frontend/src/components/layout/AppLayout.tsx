import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router";

function AppLayout() {
	return (
		<div className="flex min-h-screen bg-slate-950 text-slate-100">
			<Sidebar />

			<div className="flex min-w-0 flex-1 flex-col">
				<TopBar />

				<main className="flex-1 bg-slate-950 p-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
}

export default AppLayout;