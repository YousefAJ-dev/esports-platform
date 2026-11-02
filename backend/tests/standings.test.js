const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { resetDatabase, query, closeDatabase } = require('./helpers/database');
const { visitor } = require('./helpers/users');

before(resetDatabase);
after(closeDatabase);


test('overall standings match the seeded results', async () => {

	const res = await visitor().get('/api/standings');
	assert.equal(res.status, 200);

	// The Devas: won match 5 2-0, lost match 8 1-2
	const devas = res.body.find(row => row.team_name === 'The Devas');
	assert.deepEqual(
		{ played: devas.played, wins: devas.wins, losses: devas.losses, draws: devas.draws, for: devas.score_for, against: devas.score_against },
		{ played: 2, wins: 1, losses: 1, draws: 0, for: 3, against: 2 }
	);
});


test('teams are ranked by wins, then score difference, then fewer games played', async () => {

	const { body } = await visitor().get('/api/standings');

	for (let i = 1; i < body.length; i++) {
		const [a, b] = [body[i - 1], body[i]];
		const diff = row => row.score_for - row.score_against;

		const inOrder = a.wins > b.wins
			|| (a.wins === b.wins && diff(a) > diff(b))
			|| (a.wins === b.wins && diff(a) === diff(b) && a.played <= b.played);

		assert.ok(inOrder, `${a.team_name} should rank above ${b.team_name}`);
	}
});


test("an event's standings only include its registered teams", async () => {

	const { body } = await visitor().get('/api/standings?event_id=2');
	const registered = await query('SELECT team_id FROM event_teams WHERE event_id = 2 ORDER BY team_id');

	assert.deepEqual(body.map(row => row.team_id).sort((a, b) => a - b), registered.map(row => row.team_id));
});


test('a non-numeric event_id is rejected', async () => {

	assert.equal((await visitor().get('/api/standings?event_id=abc')).status, 400);
});
