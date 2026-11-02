const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { resetDatabase, query, closeDatabase } = require('./helpers/database');
const { admin, ROLES } = require('./helpers/users');

before(resetDatabase);
after(closeDatabase);


test('an Admin can set several roles and the overview lists all of them', async () => {

	const agent = await admin();

	await agent.put('/api/users/3/roles').send({ role_ids: [ROLES.Organizer, ROLES.Analyst] }).expect(200);

	const overview = await agent.get('/api/users/3/overview');
	assert.deepEqual(overview.body.roles, ['Organizer', 'Analyst']);
});


test("an Admin can't lock themselves out", async () => {

	const agent = await admin();   // user 1

	const demote = await agent.put('/api/users/1/roles').send({ role_ids: [ROLES.Organizer] });
	const deactivate = await agent.patch('/api/users/1').send({ is_active: false });
	const remove = await agent.delete('/api/users/1');

	assert.equal(demote.status, 400);
	assert.match(demote.body.error, /your own Admin role/);
	assert.equal(deactivate.status, 400);
	assert.equal(remove.status, 400);
});


test('role lists must contain real role IDs', async () => {

	const agent = await admin();

	assert.equal((await agent.put('/api/users/3/roles').send({ role_ids: [99] })).status, 400);
	assert.equal((await agent.put('/api/users/3/roles').send({ role_ids: 'Admin' })).status, 400);
});


test('team manager assignment follows the one-team, one-manager rules', async () => {

	const agent = await admin();

	// User 3 isn't a Team Manager yet
	const notManager = await agent.put('/api/users/3/team').send({ team_id: 1 });
	assert.equal(notManager.status, 400);

	await agent.put('/api/users/3/roles').send({ role_ids: [ROLES.Analyst, ROLES['Team Manager']] }).expect(200);

	// Team 1 already has a manager (user 4)
	const taken = await agent.put('/api/users/3/team').send({ team_id: 1 });
	assert.equal(taken.status, 409);
	assert.match(taken.body.error, /already managed by Albert Einstein/);

	await agent.put('/api/users/4/team').send({ team_id: null }).expect(200);
	await agent.put('/api/users/3/team').send({ team_id: 1 }).expect(200);

	const [current] = await query('SELECT user_id FROM team_users WHERE team_id = 1 AND end_date IS NULL');
	assert.equal(current.user_id, 3);
});


test('removing the Team Manager role ends the team assignment', async () => {

	const agent = await admin();

	// User 3 manages team 1 after the previous test
	await agent.put('/api/users/3/roles').send({ role_ids: [ROLES.Analyst] }).expect(200);

	const open = await query('SELECT 1 FROM team_users WHERE user_id = 3 AND end_date IS NULL');
	assert.equal(open.length, 0);
});
