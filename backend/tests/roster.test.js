const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { resetDatabase, query, closeDatabase } = require('./helpers/database');
const { admin, organizer } = require('./helpers/users');
const { newMatch, newMember } = require('./helpers/fixtures');

before(resetDatabase);
after(closeDatabase);

// A member who isn't on any team yet
async function freeAgent(agent, overrides = {}) {
	const res = await agent.post('/api/members').send(newMember(overrides));
	assert.equal(res.status, 201);
	return res.body.member_id;
}


test('each position has a limit: 4 Players, 1 Captain, 1 Substitute', async () => {

	const agent = await admin();
	const memberId = await freeAgent(agent);

	// Team 1 is full in the seed
	const player = await agent.post('/api/teams/1/members').send({ member_id: memberId, team_position: 'Player' });
	const captain = await agent.post('/api/teams/1/members').send({ member_id: memberId, team_position: 'Captain' });
	const substitute = await agent.post('/api/teams/1/members').send({ member_id: memberId, team_position: 'Substitute' });

	assert.equal(player.status, 409);
	assert.match(player.body.error, /4 players/);
	assert.equal(captain.status, 409);
	assert.match(captain.body.error, /captain/);
	assert.equal(substitute.status, 409);
	assert.match(substitute.body.error, /substitute/);
});


test('a member already on a team cannot join another', async () => {

	const agent = await admin();
	const res = await agent.post('/api/teams/1/members').send({ member_id: 7, team_position: 'Player' });

	assert.equal(res.status, 409);
	assert.match(res.body.error, /already on Out-Thinkers/);
});


test('inactive members and inactive teams are rejected', async () => {

	const agent = await admin();

	const inactiveMember = await freeAgent(agent, { is_active: false });
	const memberRes = await agent.post('/api/teams/3/members').send({ member_id: inactiveMember, team_position: 'Player' });
	assert.equal(memberRes.status, 400);
	assert.match(memberRes.body.error, /Inactive members/);

	// A new team has no matches, so it can be deactivated
	const team = await agent.post('/api/teams').send({ team_name: 'Benched', contact_email: 'b@x.com' });
	await agent.patch(`/api/teams/${team.body.team_id}`).send({ is_active: false }).expect(200);

	const activeMember = await freeAgent(agent);
	const teamRes = await agent.post(`/api/teams/${team.body.team_id}/members`).send({ member_id: activeMember, team_position: 'Player' });
	assert.equal(teamRes.status, 400);
	assert.match(teamRes.body.error, /inactive team/);
});


test('removing a player keeps the history and frees them up', async () => {

	const agent = await admin();

	await agent.delete('/api/teams/1/members/3').expect(200);

	const rows = await query('SELECT end_date FROM team_members WHERE team_id = 1 AND member_id = 3');
	assert.equal(rows.length, 1, 'the membership row is kept');
	assert.ok(rows[0].end_date, 'and given an end date');

	const available = await agent.get('/api/members/available');
	assert.ok(available.body.some(member => member.member_id === 3));
});


test('deactivating a member ends their team membership', async () => {

	const agent = await admin();

	await agent.patch('/api/members/8').send({ is_active: false }).expect(200);

	const open = await query('SELECT 1 FROM team_members WHERE member_id = 8 AND end_date IS NULL');
	assert.equal(open.length, 0);
});


test('a team without a Captain and 4 Players cannot register or play', async () => {

	const adminAgent = await admin();
	const organizerAgent = await organizer();

	// Team 4 drops to 3 Players (members 19 Captain, 20 Sub, 21-24 Players)
	await adminAgent.delete('/api/teams/4/members/21').expect(200);

	const register = await organizerAgent.post('/api/events/5/teams').send({ team_id: 4 });
	assert.equal(register.status, 400);
	assert.match(register.body.error, /needs a Captain and 4 Players/);

	// Team 4 is registered for event 4, but can't be put into a new match there either
	const match = await organizerAgent.post('/api/sessions').send(newMatch({ team_ids: [4, 2] }));
	assert.equal(match.status, 400);
	assert.match(match.body.error, /needs a Captain and 4 Players/);
});
