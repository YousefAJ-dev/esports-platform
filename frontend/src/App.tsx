import './App.css'

import { Route, Routes, Navigate } from 'react-router';

import AppLayout from './components/layout/AppLayout';

import DashboardPage from './pages/DashboardPage';

import EventsPage from './pages/events/EventsPage';
import EventDetailsPage from './pages/events/EventDetailsPage';
import EditEventDetails from './pages/events/EditEventDetails';
import EventCreatePage from './pages/events/CreateEventPage';

import SessionsPage from './pages/sessions/SessionsPage';
import SessionDetailsPage from './pages/sessions/SessionDetailsPage';
import EditSessionDetails from './pages/sessions/EditSessionDetails';
import SessionCreate from './pages/sessions/CreateSessionPage';


import TeamsPage from './pages/teams/TeamsPage';
import TeamDetailsPage from './pages/teams/TeamDetailsPage';
import EditTeamDetails from './pages/teams/EditTeamDetails';
import CreateTeamPage from './pages/teams/CreateTeamPage';

import MembersPage from './pages/members/MembersPage';
import MemberDetailsPage from './pages/members/MemberDetailsPage';
import EditMemberDetails from './pages/members/EditMemberDetails';
import CreateMemberPage from './pages/members/CreateMemberPage';

import StandingsPage from './pages/standings/StandingsPage';

import UsersPage from './pages/users/UsersPage';
import UserDetailsPage from './pages/users/UserDetailsPage';
import EditUserDetails from './pages/users/EditUserDetails';
import CreateUserPage from './pages/users/CreateUserPage';

import LoginPage from './pages/LoginPage';
import RequirePermission from './components/layout/RequirePermission';
import { canCreateEvent, canCreateMember, canCreateTeam, canManageTeam, isAdmin } from './helper/permissions';

// Route access at a glance (the server enforces the same rules on every request):
//   public        - dashboard, events, matches, standings (the tournament view)
//   logged in     - teams and members
//   by permission - create/edit pages and the Admin-only users section
function App() {

	return (
		<Routes>
			<Route path="login" element={<LoginPage />} />

			<Route path="/" element={<AppLayout />}>
				<Route index element={<Navigate to="/dashboard" replace />} />

				{/* Public tournament view */}
				<Route path="dashboard" element={<DashboardPage />} />
				<Route path="events" element={<EventsPage />} />
				<Route path="events/:id" element={< EventDetailsPage />} />
				<Route path="sessions" element={<SessionsPage />} />
				<Route path="sessions/:id" element={<SessionDetailsPage/>}/>
				<Route path="standings" element={<StandingsPage />} />

				{/* Organizers and Admins; ownership of the specific event is checked by the server */}
				<Route path='events/new' element={<RequirePermission allow={canCreateEvent}><EventCreatePage /></RequirePermission>}/>
				<Route path="events/:id/edit" element={<RequirePermission allow={canCreateEvent}><EditEventDetails /></RequirePermission>}/>
				<Route path='sessions/new' element={<RequirePermission allow={canCreateEvent}><SessionCreate/></RequirePermission>}/>
				<Route path="sessions/:id/edit" element={<RequirePermission allow={canCreateEvent}><EditSessionDetails/></RequirePermission>}/>

				{/* Teams and members need a login */}
				<Route path="teams" element={<RequirePermission><TeamsPage /></RequirePermission>} />
				<Route path="teams/new" element={<RequirePermission allow={canCreateTeam}><CreateTeamPage /></RequirePermission>} />
				<Route path="teams/:id" element={<RequirePermission><TeamDetailsPage /></RequirePermission>} />
				<Route path="teams/:id/edit" element={<RequirePermission allow={(user, params) => canManageTeam(user, Number(params.id))}><EditTeamDetails /></RequirePermission>} />

				<Route path="members" element={<RequirePermission><MembersPage /></RequirePermission>} />
				<Route path="members/new" element={<RequirePermission allow={canCreateMember}><CreateMemberPage /></RequirePermission>} />
				<Route path="members/:id" element={<RequirePermission><MemberDetailsPage /></RequirePermission>} />
				<Route path="members/:id/edit" element={<RequirePermission allow={canCreateMember}><EditMemberDetails /></RequirePermission>} />

				{/* Staff accounts are Admin-only */}
				<Route path="users" element={<RequirePermission allow={isAdmin}><UsersPage /></RequirePermission>} />
				<Route path="users/new" element={<RequirePermission allow={isAdmin}><CreateUserPage /></RequirePermission>} />
				<Route path="users/:id" element={<RequirePermission allow={isAdmin}><UserDetailsPage /></RequirePermission>} />
				<Route path="users/:id/edit" element={<RequirePermission allow={isAdmin}><EditUserDetails /></RequirePermission>} />

			</Route>
		</Routes>
	)
}

export default App
