const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { resetDatabase, query, closeDatabase } = require('./helpers/database');
const { organizer } = require('./helpers/users');
const { newMatch } = require('./helpers/fixtures');

before(resetDatabase);
after(closeDatabase);

// Match 13 (event 4): teams 2 vs 6, 2026-12-05 14:30-15:30 Chicago
const at = (start, end) => ({ scheduled_start: start, scheduled_end: end });

const bothScored = { results: [{ team_id: 1, score: 2, is_winner: true }, { team_id: 2, score: 1, is_winner: false }] };


test('a match needs exactly two different teams', async () => {

	const agent = await organizer();

	const one = await agent.post('/api/sessions').send(newMatch({ team_ids: [1] }));
	const same = await agent.post('/api/sessions').send(newMatch({ team_ids: [1, 1] }));

	assert.equal(one.status, 400);
	assert.match(one.body.error, /exactly 2 teams/);
	assert.equal(same.status, 400);
	assert.match(same.body.error, /against itself/);
});


test('both teams must exist and be registered for the event', async () => {

	const agent = await organizer();

	const missing = await agent.post('/api/sessions').send(newMatch({ team_ids: [1, 999] }));
	assert.equal(missing.status, 404);

	// Team 3 isn't registered for event 4
	const unregistered = await agent.post('/api/sessions').send(newMatch({ team_ids: [3, 1] }));
	assert.equal(unregistered.status, 400);
	assert.match(unregistered.body.error, /not registered/);
});


test('a team cannot play overlapping matches, but back-to-back and cancelled ones are fine', async () => {

	const agent = await organizer();

	const overlapping = await agent.post('/api/sessions').send(newMatch({ team_ids: [2, 1], ...at('2026-12-05T14:45', '2026-12-05T15:15') }));
	assert.equal(overlapping.status, 409);
	assert.match(overlapping.body.error, /already playing match #13/);

	const backToBack = await agent.post('/api/sessions').send(newMatch({ team_ids: [2, 1], ...at('2026-12-05T15:30', '2026-12-05T15:45') }));
	assert.equal(backToBack.status, 201);

	// Once match 13 is cancelled, team 6 is free in that slot
	await agent.patch('/api/sessions/13').send({ status: 'Cancelled' }).expect(200);
	const afterCancel = await agent.post('/api/sessions').send(newMatch({ team_ids: [6, 1], ...at('2026-12-05T14:45', '2026-12-05T15:15') }));
	assert.equal(afterCancel.status, 201);
});


test("a match must fall within its event's dates, and event dates can't shrink past their matches", async () => {

	const agent = await organizer();

	const outside = await agent.post('/api/sessions').send(newMatch(at('2026-12-09T10:00', '2026-12-09T11:00')));
	assert.equal(outside.status, 400);
	assert.match(outside.body.error, /within Winter Clash 2026/);

	const shrink = await agent.patch('/api/events/4').send({ start_on: '2026-12-06T12:00', end_on: '2026-12-07T19:00', timezone: 'America/Chicago' });
	assert.equal(shrink.status, 400);
	assert.match(shrink.body.error, /outside these dates/);
});


test('a rejected create leaves nothing behind', async () => {

	const agent = await organizer();
	const [before] = await query('SELECT (SELECT COUNT(*) FROM sessions)::INT AS matches, (SELECT COUNT(*) FROM session_teams)::INT AS teams');

	await agent.post('/api/sessions').send(newMatch(at('2026-12-09T10:00', '2026-12-09T11:00'))).expect(400);

	const [afterwards] = await query('SELECT (SELECT COUNT(*) FROM sessions)::INT AS matches, (SELECT COUNT(*) FROM session_teams)::INT AS teams');
	assert.deepEqual(afterwards, before);
});


test('a match is only completed once both teams have a score', async () => {

	const agent = await organizer();

	const asCompleted = await agent.post('/api/sessions').send(newMatch({ status: 'Completed' }));
	assert.equal(asCompleted.status, 400);

	const created = await agent.post('/api/sessions').send(newMatch());
	assert.equal(created.status, 201);
	const id = created.body.session_id;

	assert.equal((await agent.patch(`/api/sessions/${id}`).send({ status: 'Completed' })).status, 400, 'no results yet');

	await agent.put(`/api/sessions/${id}/results`).send({ results: [{ team_id: 1, score: 2, is_winner: true }] }).expect(200);
	assert.equal((await agent.patch(`/api/sessions/${id}`).send({ status: 'Completed' })).status, 400, 'only one team scored');

	await agent.put(`/api/sessions/${id}/results`).send(bothScored).expect(200);
	assert.equal((await agent.patch(`/api/sessions/${id}`).send({ status: 'Completed' })).status, 200);
});


test('a completed match is locked until it is reopened', async () => {

	const agent = await organizer();

	// Seeded match 1 is completed
	const details = await agent.patch('/api/sessions/1').send({ session_type: 'Final' });
	const results = await agent.put('/api/sessions/1/results').send({ results: [{ team_id: 1, score: 0, is_winner: false }] });
	const teams = await agent.put('/api/sessions/1/teams').send({ team_ids: [1, 3] });

	assert.equal(details.status, 400);
	assert.match(details.body.error, /locked/);
	assert.equal(results.status, 400);
	assert.equal(teams.status, 400);

	// Reopening is just a status change, and then edits work again
	await agent.patch('/api/sessions/1').send({ status: 'In-Progress' }).expect(200);
	assert.equal((await agent.patch('/api/sessions/1').send({ session_type: 'Quarter-Finals' })).status, 200);
});


test('a match cannot have two winners', async () => {

	const agent = await organizer();
	const res = await agent.put('/api/sessions/14/results').send({
		results: [{ team_id: 4, score: 2, is_winner: true }, { team_id: 10, score: 2, is_winner: true }],
	});

	assert.equal(res.status, 400);
	assert.match(res.body.error, /one winner/);
});


test("an event can't be completed while its matches are upcoming or live", async () => {

	const agent = await organizer();
	const res = await agent.patch('/api/events/3').send({ status: 'Completed' });

	assert.equal(res.status, 400);
	assert.match(res.body.error, /still upcoming or in progress/);
});
