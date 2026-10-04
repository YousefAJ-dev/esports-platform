const express = require('express');
const router = express.Router();



router.get('/dbhealth', (req, res) => {

	res.json( {status: "We are live!"})
	
});

module.exports = router