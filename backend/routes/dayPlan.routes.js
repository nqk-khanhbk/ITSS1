const express = require("express");
const router = express.Router();
const controllers = require("../controllers/dayPlan.controller");
const multer = require("multer");
const uploadNone = multer().none();

// TODO: Add authentication middleware to protect these routes
// const authMiddleware = require('../middlewares/auth.middleware');
// router.use(authMiddleware);

// CRUD routes for day plans
router.get("/", uploadNone, controllers.list);
router.get("/:id", uploadNone, controllers.detail);

module.exports = router;
