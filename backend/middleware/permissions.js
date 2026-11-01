// Route guards that apply the ownership rules from utils/businessRules.js.
// Used inline in route definitions so who can call a route is visible right where it's declared:
//
//   router.patch('/:id', canManageEvent(req => req.params.id), async (req, res) => { ... })
//
// Each guard takes a function that pulls the record's ID out of the request. A non-numeric ID is
// passed through untouched, because every handler already answers that with a 400.

const pool = require('../db/pool');
const { isAdmin } = require('./auth');
const {
	handleRuleError,
	assertCanManageEvent,
	assertCanManageMatch,
	assertCanManageTeam,
	assertCanEditMember,
} = require('../utils/businessRules');


// Wraps an async check: if it throws a RuleError the request stops with that 403/404
function guard(check) {

	return async (req, res, next) => {
		try {
			await check(req);
			return next();
		} catch (error) {
			if (handleRuleError(error, res)) return;
			return next(error);
		}
	};
}

// Runs check(user, id) only when the ID is a real number
const withId = (getId, check) => guard(async req => {
	const id = parseInt(getId(req));
	if (!Number.isNaN(id)) await check(req.user, id);
});


const canManageEvent = getId => withId(getId, (user, id) => assertCanManageEvent(pool, user, id));
const canManageMatch = getId => withId(getId, (user, id) => assertCanManageMatch(pool, user, id));
const canManageTeam = getId => withId(getId, (user, id) => assertCanManageTeam(user, id));
const canEditMember = getId => withId(getId, (user, id) => assertCanEditMember(pool, user, id));


// Some fields are Admin-only even on records the user may otherwise edit (e.g. is_active)
function adminOnlyFields(...fields) {

	return (req, res, next) => {

		if (!isAdmin(req.user) && fields.some(field => field in req.body)) {
			return res.status(403).json({ error: `Only Admins can change: ${fields.join(', ')}` });
		}

		return next();
	};
}


module.exports = {
	canManageEvent,
	canManageMatch,
	canManageTeam,
	canEditMember,
	adminOnlyFields,
};
