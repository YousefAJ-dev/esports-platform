// Authentication and role middleware (see docs/RBAC.md for the full picture).
//
// Order on every request (wired in app.js):
//   express-session  -> reads the cookie and loads the session row (req.session)
//   loadUser         -> turns req.session.user_id into req.user, or null for visitors
//   requireLogin     -> 401 for visitors, except on the public read list
//   route handler    -> requireRole / ownership checks decide 403 vs allowed

const pool = require('../db/pool');

const ADMIN = 'Admin';


// Loads the logged-in user with their roles and managed team in one query.
// Done on every request (not cached in the session) so deactivating a user or changing
// their roles takes effect immediately instead of when they next log in.
async function findActiveUser(userId) {

	const result = await pool.query(
		`
		SELECT
			u.user_id,
			u.username,
			u.first_name,
			u.last_name,
			COALESCE(
				array_agg(r.role_name ORDER BY r.role_name) FILTER (WHERE r.role_id IS NOT NULL),
				'{}'
			) AS roles,
			(
				SELECT tu.team_id
				FROM team_users tu
				WHERE tu.user_id = u.user_id
					AND tu.end_date IS NULL
			) AS managed_team_id

		FROM users u

		LEFT JOIN user_roles ur
			ON u.user_id = ur.user_id

		LEFT JOIN roles r
			ON ur.role_id = r.role_id

		WHERE u.user_id = $1
			AND u.is_active

		GROUP BY u.user_id
		`,
		[userId]
	);

	return result.rows[0] ?? null;
}


// Attaches req.user (or null). Never blocks a request by itself.
async function loadUser(req, res, next) {

	req.user = null;

	const userId = req.session?.user_id;
	if (!userId) return next();

	try {
		req.user = await findActiveUser(userId);

		// Deactivated or deleted since logging in: end the session so the cookie stops working
		if (!req.user) {
			return req.session.destroy(() => next());
		}

		return next();

	} catch (error) {
		return next(error);
	}
}


// GET routes anyone can read without logging in: the public tournament view.
// Everything not listed here needs a login (least privilege: deny unless allowed).
const PUBLIC_READS = [
	/^\/health$/,
	/^\/dbCheck\/dbhealth$/,
	/^\/dashboard$/,
	/^\/standings$/,
	/^\/events$/,
	/^\/events\/\d+(\/(matches|overview))?$/,
	/^\/sessions$/,
	/^\/sessions\/\d+(\/(teams|overview))?$/,
];

const isPublicRead = req => req.method === 'GET' && PUBLIC_READS.some(pattern => pattern.test(req.path));


// 401 = "we don't know who you are". Mounted on /api after the auth routes.
function requireLogin(req, res, next) {

	if (req.user || isPublicRead(req)) return next();

	return res.status(401).json({ error: "Please log in to continue" });
}


const hasRole = (user, ...roles) => Boolean(user) && (user.roles.includes(ADMIN) || roles.some(role => user.roles.includes(role)));
const isAdmin = user => Boolean(user) && user.roles.includes(ADMIN);


// 403 = "we know who you are, but your role can't do this". Admin always passes.
function requireRole(...roles) {

	return (req, res, next) => {

		if (!req.user) return res.status(401).json({ error: "Please log in to continue" });

		if (!hasRole(req.user, ...roles)) {
			return res.status(403).json({ error: "Your role doesn't allow this action" });
		}

		return next();
	};
}


module.exports = {
	ADMIN,
	loadUser,
	requireLogin,
	requireRole,
	hasRole,
	isAdmin,
	findActiveUser,
};
