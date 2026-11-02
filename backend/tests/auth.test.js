const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { resetDatabase, closeDatabase } = require('./helpers/database');
const { request, app, PASSWORD, loginAs, admin, visitor } = require('./helpers/users');

before(resetDatabase);
after(closeDatabase);


test('a correct login sets an httpOnly session cookie and /auth/me returns the user', async () => {

	const res = await request(app).post('/api/auth/login').send({ username: 'TM1AEinstein', password: PASSWORD });

	assert.equal(res.status, 200);

	const cookie = res.headers['set-cookie'].find(value => value.startsWith('arena.sid='));
	assert.ok(cookie, 'session cookie is set');
	assert.match(cookie, /HttpOnly/i);
	assert.match(cookie, /SameSite=Lax/i);

	const agent = await loginAs('TM1AEinstein');
	const me = await agent.get('/api/auth/me');

	assert.equal(me.body.username, 'TM1AEinstein');
	assert.deepEqual(me.body.roles, ['Team Manager']);
	assert.equal(me.body.managed_team_id, 1);
});


test('a wrong password and an unknown username give the same 401 message', async () => {

	const wrongPassword = await request(app).post('/api/auth/login').send({ username: 'O3OQueen', password: 'nope' });
	const unknownUser = await request(app).post('/api/auth/login').send({ username: 'nobody_here', password: PASSWORD });

	assert.equal(wrongPassword.status, 401);
	assert.equal(unknownUser.status, 401);
	assert.equal(wrongPassword.body.error, unknownUser.body.error);
});


test('usernames are case-insensitive', async () => {

	const res = await request(app).post('/api/auth/login').send({ username: 'thesysadmin', password: PASSWORD });

	assert.equal(res.status, 200);
});


test('an inactive user cannot log in', async () => {

	const adminAgent = await admin();
	await adminAgent.patch('/api/users/13').send({ is_active: false });

	const res = await request(app).post('/api/auth/login').send({ username: 'TM1OAllfather', password: PASSWORD });
	assert.equal(res.status, 401);

	await adminAgent.patch('/api/users/13').send({ is_active: true });
});


test('the 6th failed attempt is rate limited, even with the right password', async () => {

	for (let attempt = 1; attempt <= 5; attempt++) {
		const res = await request(app).post('/api/auth/login').send({ username: 'TM1WMozart', password: 'wrong' });
		assert.equal(res.status, 401, `attempt ${attempt}`);
	}

	const locked = await request(app).post('/api/auth/login').send({ username: 'TM1WMozart', password: PASSWORD });
	assert.equal(locked.status, 429);
});


test('after logout the same cookie no longer works', async () => {

	const agent = await loginAs('A2NShikimaru');
	assert.equal((await agent.get('/api/teams')).status, 200);

	await agent.post('/api/auth/logout').expect(200);

	assert.equal((await agent.get('/api/teams')).status, 401);
});


test('deactivating a user logs them out on their next request', async () => {

	const agent = await loginAs('TM1LDaVinci');   // user 7
	const adminAgent = await admin();

	await adminAgent.patch('/api/users/7').send({ is_active: false }).expect(200);

	assert.equal((await agent.get('/api/teams')).status, 401);

	await adminAgent.patch('/api/users/7').send({ is_active: true });
});


test('/auth/me returns null for visitors', async () => {

	const res = await visitor().get('/api/auth/me');

	assert.equal(res.status, 200);
	assert.equal(res.body, null);
});
