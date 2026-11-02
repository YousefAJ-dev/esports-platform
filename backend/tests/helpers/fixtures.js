// Facts about the seed data that several tests rely on (backend/db/seed/seed_data.sql).
//
// Teams 1-10 each have 6 members: Captain, Substitute, then 4 Players.
//   Team 1 = members 1-6 (1 Captain, 2 Substitute, 3-6 Players), team 2 = members 7-12, and so on.
// Events 1-2 are Completed, 3 is In-Progress, 4-5 are Upcoming; all created by the Organizer (user 2).
// Event 4 runs 2026-12-05 14:00 to 2026-12-07 19:00 (Chicago). Teams 3 and 5 aren't registered for it.

// A slot in event 4 where no seeded match is scheduled, so teams 1 and 2 are both free
const FREE_SLOT = {
	event_id: 4,
	session_type: 'Exhibition',
	timezone: 'America/Chicago',
	status: 'Upcoming',
	scheduled_start: '2026-12-06T10:00',
	scheduled_end: '2026-12-06T11:00',
};

// Body for POST /api/sessions; override any field per test
const newMatch = (overrides = {}) => ({ ...FREE_SLOT, team_ids: [1, 2], ...overrides });

// Body for POST /api/members
let memberCount = 0;
const newMember = (overrides = {}) => {
	memberCount++;
	return { real_name: `Test Player ${memberCount}`, display_name: `tp_${Date.now()}_${memberCount}`, date_of_birth: '2000-01-01', ...overrides };
};

module.exports = { FREE_SLOT, newMatch, newMember };
