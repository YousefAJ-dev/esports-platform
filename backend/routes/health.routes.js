const express = require('express');
const router = express.Router();


// Health Check Route
// app.get =	handles HTTP GET requests
//				ex. get('/url/path',(req,res))
// req =		request data(headers, params, body)
// res =		response object (what you send back)
router.get('/health', (req, res) => { // path relative to file calling it 
	// send =	Sends anything (string, object, buffer)
	res.send("API is running!")
	// json = 	Sends JSON and sets headers explicitly
})

module.exports = router