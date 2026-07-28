import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router";

function AppLayout() {

	return (
		<div className="flex min-h-screen">
			<Sidebar />
			<div className="flex-1">
				<TopBar />
				<main>
					<Outlet />
				</main>
			</div>
		</div>
	)

}

export default AppLayout