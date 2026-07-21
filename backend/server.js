require('dotenv').config();

const pool = require('./db/pool'); // this triggers db code
const app = require('./app') // importing app.js

const PORT = process.env.PORT || 3000;


// Immediately Invoked Async Function Expression (Async IIFE)
// -----------------------------------------------
// We wrap our startup logic in an async function so we can:
// 1. Use await at the top level
// 2. Control startup order (DB first, server second)
// 3. Catch failures BEFORE the server starts listening

(async () => {
	try {
		// await pauses execution of THIS function
		// until the Promise returned by pool.query() resolves
		//
		// pool.query() → returns a Promise
		// await → unwraps the resolved value into `res`
		//
		// IMPORTANT:
		// This does NOT block Node.js
		// It only pauses THIS async function
		const result = await pool.query('SELECT NOW()');

		// If we reach this line:
		// - DB credentials worked
		// - Network connection worked
		// - Postgres accepted the query
		console.log('Database connected at:', result.rows[0].now);

		// Only AFTER DB connection is confirmed
		// do we start accepting HTTP requests
		//
		// This prevents the API from running
		// while the database is unreachable
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});

	} catch (err) {
		// Any error thrown above (connection error, auth error, etc.)
		// will immediately jump here
		//
		// Common failures caught here:
		// - Wrong DB password
		// - Postgres not running
		// - Wrong host/port
		console.error('Database connection failed:', err.message);

		// Exit the Node.js process with a failure code
		// (important for Docker, CI, systemd, cloud services)
		process.exit(1);
	}
})();

