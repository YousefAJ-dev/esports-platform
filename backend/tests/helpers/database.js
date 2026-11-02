// Rebuilds the test schema from the real schema and seed files, so tests run against
// exactly what a fresh install would have.

const { schema } = require('./env');
const fs = require('fs');
const path = require('path');
const pool = require('../../db/pool');

// The SQL files include each other with psql's \i (paths relative to the repo root)
const REPO_ROOT = path.join(__dirname, '..', '..', '..');

// Reads a SQL file and inlines its \i includes, so pg can run it without psql
function loadSql(relativePath) {

	const text = fs.readFileSync(path.join(REPO_ROOT, relativePath), 'utf8');

	return text.replace(/^\\i\s+(\S+)\s*$/gm, (_, includePath) => loadSql(includePath));
}

// Drop and recreate every table, then load the seed. Each test file runs this once in before().
async function resetDatabase() {

	await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
	await pool.query(loadSql('backend/db/schema/schema.sql'));
	await pool.query(loadSql('backend/db/seed/seed_data.sql'));
}

// For assertions that look straight at the tables (e.g. history rows kept with an end_date)
async function query(text, params) {

	const result = await pool.query(text, params);
	return result.rows;
}

// Closes the pool so the test process can exit
async function closeDatabase() {
	await pool.end();
}

module.exports = { resetDatabase, query, closeDatabase };
