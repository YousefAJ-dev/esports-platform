# Backend tests

Automated checks for the API's rules: logins, permissions, rosters, matches, registration, standings and user access. They send real HTTP requests into the Express app and check the responses.

## Running them

```bash
cd backend
npm test            # run everything once
npm run test:watch  # re-run on every save
node --test tests/roster.test.js   # one file
```

They use the database login in `backend/.env`. In CI, the GitHub workflow provides it.

## Your data is safe

Tests never touch your real tables. They run in a separate Postgres **schema**, `esports_test` by default (set `TEST_DB_SCHEMA` to change it), inside the same database:

- `helpers/env.js` sets `PGOPTIONS=-c search_path=esports_test` **before** the app loads. Every query, the app's own included, then reads and writes the test schema's tables.
- `helpers/database.js` → `resetDatabase()` rebuilds that schema from the real `db/schema/schema.sql` and `db/seed/seed_data.sql` (expanding their `\i` includes, so `psql` isn't needed).
- A safety guard refuses to run unless the schema name starts with `test` or ends with `_test`.

## How a test file is laid out

```js
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { resetDatabase, closeDatabase } = require('./helpers/database');  // load first
const { organizer } = require('./helpers/users');

before(resetDatabase);   // the file starts from the seed data
after(closeDatabase);    // lets the process exit

test('an Organizer can edit their own event', async () => {
	const agent = await organizer();   // logged in; the agent keeps the session cookie
	const res = await agent.patch('/api/events/4').send({ location: 'New venue' });
	assert.equal(res.status, 200);
});
```

- **Logged-in agents:** `helpers/users.js` provides `admin()`, `organizer()`, `analyst()`, `manager()` (team 1), `manager2()` (team 2) and `visitor()`. For a fresh account, use `createUser(adminAgent, ['Organizer'])`.
- **Seed facts:** `helpers/fixtures.js` records the seed facts tests rely on, plus `newMatch()` and `newMember()` request bodies.
- **Shared state:** tests in one file share the database and run in order. Files run one at a time (`--test-concurrency=1`), each starting from a fresh seed.
- **Raw database reads:** use `query(sql, params)` from `helpers/database.js` to check the tables directly, for example that a removed player's history row is kept.

## Files

| File | Covers |
|---|---|
| `auth.test.js` | Login, the session cookie, the rate limit, logout, and deactivated users |
| `public-access.test.js` | What visitors can and can't read or change |
| `permissions.test.js` | Each role's allowed and blocked actions, and ownership |
| `roster.test.js` | Position limits, one team per member, history, full lineups |
| `matches.test.js` | Two registered teams, overlaps, event dates, completion and locking |
| `registration.test.js` | Registering for and withdrawing from events |
| `standings.test.js` | Standings numbers and ranking order |
| `user-access.test.js` | Role and manager assignment, and lockout protection |
| `deletes.test.js` | Deactivating instead of deleting |
