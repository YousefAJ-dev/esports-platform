const express = require('express') // Require express lib
const app = express() // set up variable to call server start
const cors = require('cors')
const session = require('express-session');
const PgSessionStore = require('connect-pg-simple')(session);
const pool = require('./db/pool');
const { loadUser, requireLogin, requireRole } = require('./middleware/auth');
const authRoutes = require('./routes/auth.routes');

const dbCheck = require('./routes/dbHealth.routes');
const eventsRoutes = require('./routes/events.routes');
const sessionsRoutes = require('./routes/sessions.routes');
const teamsRoutes = require('./routes/teams.routes');
const membersRoutes = require('./routes/members.routes');
const teamMembersRoutes = require('./routes/team_members.routes');
const sessionTeamsRoutes = require('./routes/session_teams.routes');
const matchDetailsRoutes = require('./routes/match_details.routes');
const usersRoutes = require('./routes/users.routes');
const teamUsersRoutes = require('./routes/team_users.routes');
const rolesRoutes = require('./routes/roles.routes');
const userRolesRoutes = require('./routes/user_roles.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const standingsRoutes = require('./routes/standings.routes');


// Only needed when the frontend runs on a different origin than the API (VITE_API_BASE_URL).
// The Vite dev proxy makes requests same-origin, so this stays off unless CORS_ORIGIN is set.
// credentials: true lets the browser send the session cookie cross-origin.
if (process.env.CORS_ORIGIN) {
	app.use(cors({
		origin: process.env.CORS_ORIGIN,
		credentials: true
	}));
}

// Signs the session cookie so it can't be forged; refusing to start beats running with a weak default
if (!process.env.SESSION_SECRET) {
	throw new Error("SESSION_SECRET is missing from .env - add a long random string");
}

const isProduction = process.env.NODE_ENV === 'production';
const SESSION_COOKIE = 'arena.sid';
app.set('sessionCookieName', SESSION_COOKIE);

// Behind a proxy/load balancer in production, trust it so secure cookies work over its HTTPS
if (isProduction) app.set('trust proxy', 1);

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
// Skipped while the automated tests run so their output only shows results
const isTest = process.env.NODE_ENV === 'test';

if (!isTest) {
	app.use((req, res, next) => {
		const time = new Date().toISOString();
		console.log(`[${time}] ${req.method} ${req.originalUrl}`);
		next();
	});
}

// Sessions: the cookie only holds a random ID; the session itself lives in the auth_sessions table
app.use(session({
	name: SESSION_COOKIE,
	secret: process.env.SESSION_SECRET,
	// The store prunes expired sessions on a timer; tests turn it off so each test process can exit
	store: new PgSessionStore({ pool, tableName: 'auth_sessions', pruneSessionInterval: isTest ? false : undefined }),
	resave: false,              // don't rewrite unchanged sessions
	saveUninitialized: false,   // visitors don't get a session until they log in
	rolling: true,              // each request pushes the expiry back, so active users stay logged in
	cookie: {
		httpOnly: true,         // JavaScript can't read the cookie (protects it from injected scripts)
		sameSite: 'lax',        // not sent on cross-site form posts (blocks most CSRF)
		secure: isProduction,   // HTTPS only in production
		maxAge: 8 * 60 * 60 * 1000 // 8 hours of inactivity
	}
}));

// Who is making this request? Sets req.user, or null for visitors
app.use('/api', loadUser);

// Login/logout/me must work without being logged in
app.use('/api/auth', authRoutes);

// From here on, visitors only get the public tournament reads (see PUBLIC_READS in middleware/auth.js)
app.use('/api', requireLogin);

app.use('/api/dbCheck', dbCheck);

// Admin-only areas: staff accounts, role assignment, and the old direct-table routes
// (requireRole() with no roles listed means Admin only)
const adminOnly = requireRole();
app.use('/api/events', eventsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/team_members', adminOnly, teamMembersRoutes);
app.use('/api/session_teams', adminOnly, sessionTeamsRoutes);
app.use('/api/match_details', adminOnly, matchDetailsRoutes);
app.use('/api/users', adminOnly, usersRoutes);
app.use('/api/team_users', adminOnly, teamUsersRoutes);
app.use('/api/roles', adminOnly, rolesRoutes);
app.use('/api/user_roles', adminOnly, userRolesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/standings', standingsRoutes);


module.exports = app