const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db/pool');


// ---- Login rate limit -------------------------------------------------------
// Slows password guessing: 5 failed attempts per IP + username, then a 15 minute wait.
// Kept in memory, so it resets on restart; enough for one server, a shared store would be needed for several.
const MAX_FAILURES = 5;
const LOCK_WINDOW_MS = 15 * 60 * 1000;
const failures = new Map(); // key -> { count, firstAt }

const attemptKey = (req, username) => `${req.ip}|${username.toLowerCase()}`;

function isLocked(key) {

	const entry = failures.get(key);
	if (!entry) return false;

	// Window over: forget the old failures
	if (Date.now() - entry.firstAt > LOCK_WINDOW_MS) {
		failures.delete(key);
		return false;
	}

	return entry.count >= MAX_FAILURES;
}

function recordFailure(key) {

	const entry = failures.get(key);

	if (entry) entry.count++;
	else failures.set(key, { count: 1, firstAt: Date.now() });
}

// Compared against when the username doesn't exist, so a wrong username takes as long as a
// wrong password. Otherwise response timing would reveal which usernames are real.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);


// POST api/auth/login - check the password and start a session
router.post('/login', async (req, res) => {

	const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
	const password = typeof req.body.password === 'string' ? req.body.password : '';

	if (!username || !password) {
		return res.status(400).json({ error: "Username and password are required" });
	}

	const key = attemptKey(req, username);

	if (isLocked(key)) {
		return res.status(429).json({ error: "Too many failed attempts. Try again in 15 minutes" });
	}

	try {

		const result = await pool.query(
			`SELECT user_id, password_hash, is_active FROM users WHERE LOWER(username) = LOWER($1)`,
			[username]
		);

		const user = result.rows[0];

		// Passwords are only ever compared as bcrypt hashes, never stored or logged in plain text
		const passwordMatches = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);

		// One message for every failure, so attackers can't tell which usernames exist
		if (!user || !passwordMatches || !user.is_active) {
			recordFailure(key);
			return res.status(401).json({ error: "Invalid username or password" });
		}

		failures.delete(key);

		// New session ID on login. If an attacker planted a session ID in this browser beforehand
		// (session fixation), it becomes useless the moment the real user logs in.
		req.session.regenerate(error => {

			if (error) {
				console.error("Error starting session:", error.message);
				return res.status(500).json({ error: "Internal Server Error" });
			}

			// The session only stores who you are; roles are looked up fresh on every request
			req.session.user_id = user.user_id;

			req.session.save(saveError => {
				if (saveError) {
					console.error("Error saving session:", saveError.message);
					return res.status(500).json({ error: "Internal Server Error" });
				}
				return res.status(200).json({ message: "Logged in" });
			});
		});

	} catch (error) {

		console.error("Error logging in:", error.message);

		return res.status(500).json({ error: "Internal Server Error" });
	}

});


// POST api/auth/logout - delete the session row so the cookie stops working immediately
router.post('/logout', (req, res) => {

	req.session.destroy(error => {

		if (error) {
			console.error("Error logging out:", error.message);
			return res.status(500).json({ error: "Internal Server Error" });
		}

		res.clearCookie(req.app.get('sessionCookieName'));
		return res.status(200).json({ message: "Logged out" });
	});

});


// GET api/auth/me - who is logged in (null for visitors). req.user comes from loadUser.
router.get('/me', (req, res) => {

	return res.status(200).json(req.user);

});


module.exports = router;
