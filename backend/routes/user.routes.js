const express = require("express");
const router = express.Router();
const controllers = require('../controllers/user.controller');
const multer = require('multer');
const uploadNone = multer().none(); // accept only text fields from multipart/form-data

// Supports JSON, x-www-form-urlencoded, multipart/form-data (no files)
router.post('/register', uploadNone, controllers.register)
router.post('/login', uploadNone, controllers.login)

module.exports = router;
