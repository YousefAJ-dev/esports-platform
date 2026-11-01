
// Maps known Postgres constraint errors on match results to client errors instead of 500s
const FK_VIOLATION = '23503';
const UNIQUE_VIOLATION = '23505';
const CHECK_VIOLATION = '23514';

function handleDbError(error, res, action) {

	if (error.code === FK_VIOLATION) {
		return res.status(400).json({ error: "Team is not part of this session" });
	}

	if (error.code === UNIQUE_VIOLATION) {
		return res.status(409).json({ error: "Result already exists or session already has a winner" });
	}

	if (error.code === CHECK_VIOLATION) {
		return res.status(400).json({ error: "Score cannot be negative" });
	}

	console.error(`Error ${action} match details:`, error.message);

	return res.status(500).json({ error: "Internal Server Error" });
}

module.exports = {
	handleDbError
};
