# Access Control (RBAC)

How the platform decides **who you are** and **what you're allowed to do**, and where each rule lives in the code.

## The ideas in plain terms

| Idea | What it means here |
|---|---|
| **Authentication** (who are you?) | You log in with a username and password. The server compares the password to a stored **bcrypt hash**; plain passwords are never stored. |
| **Session** (remembering you) | After login the server stores `{ user_id }` in the `auth_sessions` table and gives the browser a cookie holding only a random session ID. The browser sends it back on every request. |
| **Authorization** (what can you do?) | Checked on the **server on every request**, after we know who you are. |
| **Role** | A named bundle of permissions (Admin, Organizer, Team Manager, Analyst). Users get roles; a user with several roles gets everything those roles allow. |
| **Ownership** | Some permissions depend on *which* record: Organizers manage **their own** events, Team Managers manage **their own** team. |
| **401 vs 403** | **401**: not logged in (or the session expired). **403**: logged in, but your role or ownership doesn't allow this. |
| **Least privilege** | Anything not explicitly allowed is denied. Visitors only get a short list of public reads. |
| **Defense in depth** | The UI hides buttons you can't use, but that's only convenience. The server enforces every rule, because anyone can send requests directly. |

## Who can do what

| | Visitor | Analyst | Team Manager | Organizer | Admin |
|---|---|---|---|---|---|
| Dashboard, events, brackets, matches, standings | View | View | View | View | View |
| Teams and members (pages and rosters) | – | View | View | View | View |
| Create an event | – | – | – | ✓ | ✓ |
| Edit an event, register teams, create and edit its matches and results | – | – | – | Own events | All |
| Create a team | – | – | ✓ (one team only) | – | ✓ |
| Edit a team, manage its roster | – | – | Own team | – | All |
| Create members | – | – | ✓ | – | ✓ |
| Edit member details | – | – | Members on own roster | – | All |
| Activate/deactivate or delete teams and members | – | – | – | – | ✓ |
| Users, roles, manager assignments | – | – | – | – | ✓ |

Roster rules that apply to everyone: at most 1 Captain, 4 Players and 1 Substitute per team. A team needs a Captain and 4 Players to register for an event or play a match.

## Where it lives in the code

| Piece | File | What it does |
|---|---|---|
| Session setup | `backend/app.js` | Cookie settings (`httpOnly`, `sameSite: 'lax'`, `secure` in production, 8-hour rolling expiry) and the Postgres session store. Also the order every request goes through. |
| Login / logout / me | `backend/routes/auth.routes.js` | Password check, session ID regenerated on login, generic error message, 5-failure rate limit. |
| `loadUser` | `backend/middleware/auth.js` | Turns the session into `req.user` (user, roles, managed team), reloaded every request so deactivation and role changes apply immediately. |
| `requireLogin` + `PUBLIC_READS` | `backend/middleware/auth.js` | Returns 401 to visitors except on the public tournament reads. |
| `requireRole(...)` | `backend/middleware/auth.js` | Returns 403 unless the user has one of the roles (Admin always passes). `requireRole()` with no roles means Admin only. |
| Ownership rules | `backend/utils/businessRules.js` | `assertCanManageEvent`, `assertCanManageMatch`, `assertCanManageTeam`, `assertCanEditMember`. |
| Route guards | `backend/middleware/permissions.js` | Wraps the ownership rules so routes can declare them inline, plus `adminOnlyFields('is_active')`. |
| Ownership data | `backend/db/schema/015_ownership.sql` | `events.created_by` and one active team per manager in `team_users`. |

## How a request flows

Here's what happens when Organizer `O3OQueen` (user 2) edits match 22:

1. The browser sends `PATCH /api/sessions/22`, and the session cookie goes with it automatically.
2. `express-session` finds the session row, which holds `user_id = 2`.
3. `loadUser` loads user 2 with roles `[Organizer]` and sets `req.user`.
4. `requireLogin` sees that `req.user` is set, so the request continues. A visitor would stop here with a 401.
5. The route's guard, `canManageMatch(req => req.params.id)`, finds that match 22 belongs to event 4, which user 2 created, so the request continues. An Analyst, or a different Organizer, would stop here with a 403.
6. The handler runs the normal business rules (event dates, completed lock, and so on) and saves the change.

## Reading a route's permissions

Each guard is declared on the route itself:

```js
router.patch('/:id', canManageTeam(req => req.params.id), adminOnlyFields('is_active'), async (req, res) => { ... })
```

Read it left to right. This route requires that you manage this team, and only an Admin may change `is_active`.

## Dev logins

Every seeded user's password is `ArenaDev2026!`. See the README for which username has which role.
