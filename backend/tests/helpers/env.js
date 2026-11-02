// Test environment. Must load before db/pool.js or app.js, because both read process.env
// when they're first required. Every other helper requires this first.

const path = require('path');

// Database login comes from backend/.env locally; in CI the workflow sets it, and dotenv
// never overrides variables that are already set.
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });

const schema = process.env.TEST_DB_SCHEMA || 'esports_test';

// Safety guard: the tests drop and rebuild every table in this schema, so it must clearly
// be a test schema. This makes it impossible to point the suite at your real data in public.
if (!/^[a-z_][a-z0-9_]*$/.test(schema) || !(schema.startsWith('test') || schema.endsWith('_test'))) {
	throw new Error(`TEST_DB_SCHEMA "${schema}" must start with "test" or end with "_test"`);
}

process.env.NODE_ENV = 'test';

// Every connection the pool opens starts with search_path set to the test schema,
// so all queries (including the app's own) read and write the test tables.
process.env.PGOPTIONS = `-c search_path=${schema}`;

process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-only-session-secret';

module.exports = { schema };
