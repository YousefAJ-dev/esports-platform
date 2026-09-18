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


import TeamsPage from './pages/TeamsPage';
import MembersPage from './pages/MembersPage';
import UsersPage from './pages/UsersPage';

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
				
				
				<Route path="teams" element={<TeamsPage />} />
				<Route path="members" element={< MembersPage />} />
				<Route path="users" element={< UsersPage />} />

			</Route>
		</Routes>
	)
}

export default App
