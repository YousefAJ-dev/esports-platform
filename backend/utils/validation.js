
// API Field Validation
function isMissing(value) {

	return (value === undefined ||
		value === null ||
		(typeof value === 'string' && value.trim() === '')
	);

}

function getMissingFields(requiredFields, body) {

	return requiredFields.filter(field => isMissing(body[field]));

}

module.exports = {
	getMissingFields
};