-- Ownership links used by role checks (see docs/RBAC.md).
-- Run after users exists, since both reference it.

-- The user who planned the event; Organizers can only manage events they created
ALTER TABLE events
	ADD COLUMN created_by INTEGER
	REFERENCES users(user_id);

-- A Team Manager runs one team at a time (an open assignment has no end_date)
CREATE UNIQUE INDEX uq_active_team_manager
	ON team_users(user_id)
	WHERE end_date IS NULL;
