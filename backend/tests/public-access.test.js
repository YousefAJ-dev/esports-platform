const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { resetDatabase, closeDatabase } = require('./helpers/database');
const { visitor } = require('./helpers/users');

before(resetDatabase);
after(closeDatabase);


test('visitors can read the public tournament view', async () => {

	const publicReads = [
		'/api/dashboard',
		'/api/events',
		'/api/events/1',
		'/api/events/1/matches',
		'/api/events/1/overview',
		'/api/sessions',
		'/api/sessions/1',
		'/api/sessions/1/teams',
		'/api/sessions/1/overview',
		'/api/standings',
		'/api/standings?event_id=1',
	];

	const agent = visitor();

	for (const path of publicReads) {
		const res = await agent.get(path);
		assert.equal(res.status, 200, `GET ${path}`);
	}
});


test('visitors get 401 on private reads', async () => {

	const privateReads = [
		'/api/teams',
		'/api/teams/1',
		'/api/teams/1/roster',
		'/api/members',
		'/api/members/1',
		'/api/members/available',
		'/api/users',
		'/api/events/1/teams',
		'/api/events/1/schedule',
	];

	const agent = visitor();

	for (const path of privateReads) {
		const res = await agent.get(path);
		assert.equal(res.status, 401, `GET ${path}`);
	}
});


test('visitors get 401 on every kind of write', async () => {

	const writes = [
		['post', '/api/events', {}],
		['patch', '/api/events/4', { location: 'x' }],
		['post', '/api/sessions', {}],
		['put', '/api/sessions/13/results', { results: [] }],
		['post', '/api/teams', {}],
		['post', '/api/teams/1/members', { member_id: 1, team_position: 'Player' }],
		['post', '/api/members', {}],
		['post', '/api/events/4/teams', { team_id: 3 }],
	];

	const agent = visitor();

	for (const [method, path, body] of writes) {
		const res = await agent[method](path).send(body);
		assert.equal(res.status, 401, `${method.toUpperCase()} ${path}`);
	}
});
