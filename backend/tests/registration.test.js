const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { resetDatabase, closeDatabase } = require('./helpers/database');
const { admin, organizer } = require('./helpers/users');

before(resetDatabase);
after(closeDatabase);


test('a team can register once', async () => {

	const agent = await organizer();

	// Team 3 has a full lineup and isn't registered for event 4 yet
	assert.equal((await agent.post('/api/events/4/teams').send({ team_id: 3 })).status, 201);

	const again = await agent.post('/api/events/4/teams').send({ team_id: 3 });
	assert.equal(again.status, 409);
});


test('a team can withdraw only if it has no matches in the event', async () => {

	const agent = await organizer();

	// Team 3 was just registered and has no event 4 matches
	assert.equal((await agent.delete('/api/events/4/teams/3')).status, 200);

	// Team 1 plays match 15 in event 4
	const blocked = await agent.delete('/api/events/4/teams/1');
	assert.equal(blocked.status, 409);
	assert.match(blocked.body.error, /Remove it from those first/);
});


test('inactive teams cannot register', async () => {

	const adminAgent = await admin();
	const team = await adminAgent.post('/api/teams').send({ team_name: 'Retired', contact_email: 'r@x.com' });
	await adminAgent.patch(`/api/teams/${team.body.team_id}`).send({ is_active: false }).expect(200);

	const res = await (await organizer()).post('/api/events/4/teams').send({ team_id: team.body.team_id });

	assert.equal(res.status, 400);
	assert.match(res.body.error, /Inactive teams/);
});


test('completed and cancelled events are closed for registration', async () => {

	const agent = await organizer();

	const completed = await agent.post('/api/events/1/teams').send({ team_id: 3 });
	assert.equal(completed.status, 400);
	assert.match(completed.body.error, /completed event/);

	await agent.patch('/api/events/5').send({ status: 'Cancelled' }).expect(200);
	const cancelled = await agent.post('/api/events/5/teams').send({ team_id: 1 });
	assert.equal(cancelled.status, 400);
	assert.match(cancelled.body.error, /cancelled event/);
});
