const express = require('express');
const router = express.Router();



router.get('/db-health', (req, res) => {

	console.log("Server is up and running!");
	
});

module.exports = router