const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { resetDatabase, closeDatabase } = require('./helpers/database');
const { admin } = require('./helpers/users');
const { newMember } = require('./helpers/fixtures');

before(resetDatabase);
after(closeDatabase);


test('records with history are deactivated, not deleted', async () => {

	const agent = await admin();

	for (const path of ['/api/teams/1', '/api/members/1', '/api/users/2']) {
		const res = await agent.delete(path);
		assert.equal(res.status, 409, `DELETE ${path}`);
		assert.match(res.body.error, /Deactivate it instead/);
	}
});


test('records without history can still be deleted', async () => {

	const agent = await admin();

	const team = await agent.post('/api/teams').send({ team_name: 'Temp', contact_email: 't@x.com' });
	const member = await agent.post('/api/members').send(newMember());
	const user = await agent.post('/api/users').send({
		first_name: 'Temp', last_name: 'User', username: `temp_${Date.now()}`, email: `temp_${Date.now()}@x.com`, password: 'ArenaDev2026!',
	});

	assert.equal((await agent.delete(`/api/teams/${team.body.team_id}`)).status, 200);
	assert.equal((await agent.delete(`/api/members/${member.body.member_id}`)).status, 200);
	assert.equal((await agent.delete(`/api/users/${user.body.user_id}`)).status, 200);
});


test('a team with matches still to play cannot be deactivated', async () => {

	const res = await (await admin()).patch('/api/teams/9').send({ is_active: false });

	assert.equal(res.status, 409);
	assert.match(res.body.error, /upcoming or live/);
});
