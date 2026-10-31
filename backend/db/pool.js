const { Pool, types } = require('pg');

// Return DATE columns (OID 1082) as 'YYYY-MM-DD' strings to avoid timezone day-shifts
types.setTypeParser(1082, value => value);

const pool = new Pool({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	database: process.env.DB_NAME,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
});


module.exports = pool;