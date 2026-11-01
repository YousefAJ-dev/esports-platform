DROP TABLE IF EXISTS auth_sessions;

-- Login sessions for express-session (stored by connect-pg-simple).
-- A row holds one logged-in browser: sid is the random ID kept in the cookie, sess holds { user_id },
-- and expire is when the login stops working. Named auth_sessions because sessions is the matches table.
CREATE TABLE auth_sessions (
	sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
	sess JSON NOT NULL,
	expire TIMESTAMP(6) NOT NULL
);

-- Expired sessions are cleaned up by expire, so index it
CREATE INDEX idx_auth_sessions_expire ON auth_sessions(expire);
