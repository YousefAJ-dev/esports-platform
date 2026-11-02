const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { resetDatabase, closeDatabase } = require('./helpers/database');
const { admin, organizer, analyst, manager, createUser } = require('./helpers/users');
const { newMatch, newMember } = require('./helpers/fixtures');

before(resetDatabase);
after(closeDatabase);

const NEW_EVENT = {
	event_name: 'Test Cup',
	location: 'Austin, TX',
	start_on: '2027-04-01T10:00',
	end_on: '2027-04-02T18:00',
	timezone: 'America/Chicago',
};


test('Analysts can read everything but every write is 403', async () => {

	const agent = await analyst();

	for (const path of ['/api/teams', '/api/teams/1/roster', '/api/members', '/api/events/4/teams']) {
		assert.equal((await agent.get(path)).status, 200, `GET ${path}`);
	}

	const writes = [
		['post', '/api/events', NEW_EVENT],
		['post', '/api/sessions', newMatch()],
		['patch', '/api/teams/1', { team_name: 'x' }],
		['post', '/api/members', newMember()],
		['post', '/api/teams/1/members', { member_id: 1, team_position: 'Player' }],
		['put', '/api/sessions/13/results', { results: [{ team_id: 2, score: 1, is_winner: true }] }],
	];

	for (const [method, path, body] of writes) {
		assert.equal((await agent[method](path).send(body)).status, 403, `${method.toUpperCase()} ${path}`);
	}
});


test('creating an event records the Organizer as its owner', async () => {

	const agent = await organizer();
	const res = await agent.post('/api/events').send(NEW_EVENT);

	assert.equal(res.status, 201);
	assert.equal(res.body.created_by, 2);
});


test('an Organizer can edit their own event and its matches', async () => {

	const agent = await organizer();

	assert.equal((await agent.patch('/api/events/4').send({ location: 'Houston, TX (Main Hall)' })).status, 200);
	assert.equal((await agent.patch('/api/sessions/13').send({ session_type: 'Qualifier' })).status, 200);
});


test("another Organizer can't touch an event they didn't create", async () => {

	const adminAgent = await admin();
	const { agent: other } = await createUser(adminAgent, ['Organizer']);

	const attempts = [
		['patch', '/api/events/4', { location: 'hijacked' }],
		['post', '/api/sessions', newMatch()],
		['post', '/api/events/4/teams', { team_id: 3 }],
		['put', '/api/sessions/13/results', { results: [{ team_id: 2, score: 1, is_winner: true }] }],
	];

	for (const [method, path, body] of attempts) {
		const res = await other[method](path).send(body);
		assert.equal(res.status, 403, `${method.toUpperCase()} ${path}`);
		assert.match(res.body.error, /events you created/);
	}
});


test("Organizers can't create teams or members", async () => {

	const agent = await organizer();

	assert.equal((await agent.post('/api/teams').send({ team_name: 'x', contact_email: 'x@x.com' })).status, 403);
	assert.equal((await agent.post('/api/members').send(newMember())).status, 403);
});


test('a Team Manager runs their own team but not anyone else\'s', async () => {

	const agent = await manager();   // team 1

	assert.equal((await agent.patch('/api/teams/1').send({ team_name: 'Quantum Titans' })).status, 200);

	// Make room on their roster, then sign a new player
	assert.equal((await agent.delete('/api/teams/1/members/3')).status, 200);
	const member = await agent.post('/api/members').send(newMember());
	assert.equal(member.status, 201);
	assert.equal((await agent.post('/api/teams/1/members').send({ member_id: member.body.member_id, team_position: 'Player' })).status, 201);

	// Another team is off limits
	assert.equal((await agent.patch('/api/teams/2').send({ team_name: 'hijacked' })).status, 403);
	assert.equal((await agent.delete('/api/teams/2/members/9')).status, 403);
	assert.equal((await agent.post('/api/teams/2/members').send({ member_id: 3, team_position: 'Player' })).status, 403);

	// One team per manager
	assert.equal((await agent.post('/api/teams').send({ team_name: 'Second Team', contact_email: 's@x.com' })).status, 403);
});


test("Team Managers can't change is_active, and can only edit members on their roster", async () => {

	const agent = await manager();

	assert.equal((await agent.patch('/api/teams/1').send({ is_active: false })).status, 403);
	assert.equal((await agent.patch('/api/members/1').send({ is_active: false })).status, 403);

	assert.equal((await agent.patch('/api/members/1').send({ display_name: 'MCurie' })).status, 200);
	assert.equal((await agent.patch('/api/members/7').send({ display_name: 'hijacked' })).status, 403);
});


test('a new Team Manager becomes the manager of the team they create', async () => {

	const adminAgent = await admin();
	const { agent } = await createUser(adminAgent, ['Team Manager']);

	assert.equal((await agent.get('/api/auth/me')).body.managed_team_id, null);

	const team = await agent.post('/api/teams').send({ team_name: 'Fresh Squad', contact_email: 'fresh@x.com' });
	assert.equal(team.status, 201);

	assert.equal((await agent.get('/api/auth/me')).body.managed_team_id, team.body.team_id);
});


test('Admin-only areas return 403 to everyone else', async () => {

	const agents = [await organizer(), await analyst(), await manager()];
	const adminOnly = ['/api/users', '/api/roles', '/api/user_roles', '/api/team_users', '/api/team_members', '/api/session_teams', '/api/match_details'];

	for (const agent of agents) {
		for (const path of adminOnly) {
			assert.equal((await agent.get(path)).status, 403, `GET ${path}`);
		}
	}
});


test('an Admin can edit any event, team and member', async () => {

	const agent = await admin();

	assert.equal((await agent.patch('/api/events/5').send({ location: 'Las Vegas, NV' })).status, 200);
	assert.equal((await agent.patch('/api/teams/2').send({ team_name: 'Out-Thinkers' })).status, 200);
	assert.equal((await agent.patch('/api/members/7').send({ display_name: 'RNGauss' })).status, 200);
});
