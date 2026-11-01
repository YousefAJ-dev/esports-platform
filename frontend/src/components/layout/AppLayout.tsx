import { useState } from "react";
import { Outlet } from "react-router";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";

const COLLAPSED_KEY = "sidebar-collapsed";

// Remembered per browser; storage can be unavailable (private mode), so fall back quietly
function readCollapsed() {
	try {
		return localStorage.getItem(COLLAPSED_KEY) === "true";
	} catch {
		return false;
	}
}

function AppLayout() {

	const [collapsed, setCollapsed] = useState<boolean>(readCollapsed);
	const [mobileOpen, setMobileOpen] = useState<boolean>(false);

	const toggleCollapsed = () => {
		setCollapsed(current => {
			try {
				localStorage.setItem(COLLAPSED_KEY, String(!current));
			} catch {
				// Not saved, but the toggle still works for this visit
			}
			return !current;
		});
	};

	return (
		<div className="flex min-h-screen bg-slate-950 text-slate-100">
			<Sidebar
				collapsed={collapsed}
				mobileOpen={mobileOpen}
				onToggleCollapsed={toggleCollapsed}
				onCloseMobile={() => setMobileOpen(false)}
			/>

			<div className="flex min-w-0 flex-1 flex-col">
				<TopBar onOpenMenu={() => setMobileOpen(true)} />

				<main className="flex-1 bg-slate-950 p-4 md:p-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
}

export default AppLayout;
