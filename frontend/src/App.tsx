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

function App() {

	return (
		<Routes>
			<Route path="/" element={<AppLayout />}>
				<Route index element={<Navigate to="/dashboard" replace />} />

				<Route path="dashboard" element={<DashboardPage />} />

				<Route path="events" element={<EventsPage />} />
				<Route path="events/:id" element={< EventDetailsPage />} />
				<Route path="events/:id/edit" element={<EditEventDetails />}/>
				<Route path='events/new' element={<EventCreatePage /> }/>

				<Route path="sessions" element={<SessionsPage />} />
				<Route path="sessions/:id" element={<SessionDetailsPage/>}/>
				<Route path="sessions/:id/edit" element={<EditSessionDetails/>}/>
				<Route path='sessions/new' element={<SessionCreate/>}/>
				
				<Route path="standings" element={<StandingsPage />} />

				<Route path="teams" element={<TeamsPage />} />
				<Route path="teams/:id" element={<TeamDetailsPage />} />
				<Route path="teams/:id/edit" element={<EditTeamDetails />} />
				<Route path="teams/new" element={<CreateTeamPage />} />

				<Route path="members" element={<MembersPage />} />
				<Route path="members/:id" element={<MemberDetailsPage />} />
				<Route path="members/:id/edit" element={<EditMemberDetails />} />
				<Route path="members/new" element={<CreateMemberPage />} />

				<Route path="users" element={<UsersPage />} />
				<Route path="users/:id" element={<UserDetailsPage />} />
				<Route path="users/:id/edit" element={<EditUserDetails />} />
				<Route path="users/new" element={<CreateUserPage />} />

			</Route>
		</Routes>
	)
}

export default App
