// Logged-in "browsers" for each seeded role. supertest.agent() keeps the session cookie
// between requests, just like a real browser, so a test logs in once and then acts as that user.

require('./env');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../../app');

// Every seeded user's dev password (see README)
const PASSWORD = 'ArenaDev2026!';

async function loginAs(username, password = PASSWORD) {

	const agent = request.agent(app);
	const res = await agent.post('/api/auth/login').send({ username, password });

	assert.equal(res.status, 200, `login as ${username} failed: ${JSON.stringify(res.body)}`);
	return agent;
}

// Seeded accounts (backend/db/seed/seed_data.sql)
const admin = () => loginAs('TheSysAdmin');        // user 1
const organizer = () => loginAs('O3OQueen');       // user 2, owns every seeded event
const analyst = () => loginAs('A2NShikimaru');     // user 3
const manager = () => loginAs('TM1AEinstein');     // user 4, manages team 1 (Quantum Titans)
const manager2 = () => loginAs('TM1TSocrates');    // user 5, manages team 2 (Out-Thinkers)

// Not logged in; still keeps cookies, in case a test logs in later
const visitor = () => request.agent(app);

// role_id values from the seed
const ROLES = { Admin: 1, Organizer: 2, Analyst: 3, 'Team Manager': 4 };

let counter = 0;

// Creates a fresh user through the Admin API with the given roles and returns their ID and a logged-in agent
async function createUser(adminAgent, roles = []) {

	counter++;
	const username = `test_user_${Date.now()}_${counter}`;

	const created = await adminAgent.post('/api/users').send({
		first_name: 'Test',
		last_name: `User${counter}`,
		username,
		email: `${username}@example.com`,
		password: PASSWORD,
	});
	assert.equal(created.status, 201, JSON.stringify(created.body));

	const userId = created.body.user_id;

	if (roles.length > 0) {
		const set = await adminAgent.put(`/api/users/${userId}/roles`).send({ role_ids: roles.map(role => ROLES[role]) });
		assert.equal(set.status, 200, JSON.stringify(set.body));
	}

	return { userId, username, agent: await loginAs(username) };
}

module.exports = { app, request, PASSWORD, ROLES, loginAs, admin, organizer, analyst, manager, manager2, visitor, createUser };
