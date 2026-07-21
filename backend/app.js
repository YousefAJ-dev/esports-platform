const express = require('express') // Require express lib
const app = express() // set up variable to call server start

const dbCheck = require('./routes/dbHealth.routes')
const eventsRoutes = require('./routes/events.routes');
const sessionsRoutes = require('./routes/sessions.routes');
const teamsRoutes = require('./routes/teams.routes');
const membersRoutes = require('./routes/members.routes');
const teamMembersRoutes = require('./routes/team_members.routes');
const sessionTeamsRoutes = require('./routes/session_teams.routes');
const usersRoutes = require('./routes/users.routes');
const teamUsersRoutes = require('./routes/team_users.routes');
const rolesRoutes = require('./routes/roles.routes');
const userRolesRoutes = require('./routes/user_roles.routes');
const dashboardRoutes = require('./routes/dashboard.routes');


// Global Middleware
// 				runs BEFORE route logic (.use)
//				read/modify requests and response

// app.use = 	mounts middleware function or routers,
//			 	allowing you to add functionality like 
// 			 	logging, parsing JSON/form data, serving
//			 	static files, or handling specific URL paths
//			 	essential for node.js web apps and APIs
//		
app.use(express.json())


// Log API requests by time, method, and path/URL
// req.method → returned HTTP type: i.e GET, POST or PATCH
// req.originalUrl → /api/health
// next() → allows request to continue
// EXAMPLE REQUESTS
/* 	GET /api/health
	POST /api/members
	DELETE /api/sessions/2
*/
app.use((req, res, next) => {
	const time = new Date().toISOString();
	console.log(`[${time}] ${req.method} ${req.originalUrl}`);
	next();
});


app.use('/api/events', eventsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/team_members', teamMembersRoutes);
app.use('/api/session_teams', sessionTeamsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/team_users', teamUsersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/user_roles', userRolesRoutes);
app.use('/api/dashboard', dashboardRoutes);


module.exports = app