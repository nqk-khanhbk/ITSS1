const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");

// URL: /api/reviews/:place_id
// Ví dụ: /api/reviews/656... (ID của địa điểm)
router.get("/:place_id", reviewController.getReviewsByPlace);

module.exports = router;