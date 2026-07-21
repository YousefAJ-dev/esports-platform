const express = require('express')
const router = express.Router() 

// Simple Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});