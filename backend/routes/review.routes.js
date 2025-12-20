const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// ============ PUBLIC ROUTES ============

// Lấy thống kê review theo place (sao trung bình, phân bố rating, facilities)
// GET /api/reviews/stats/:place_id
router.get("/stats/:place_id", reviewController.getReviewStatsByPlace);

// Lấy danh sách review theo place
// GET /api/reviews/place/:place_id
router.get("/place/:place_id", reviewController.getReviewsByPlace);

// Lấy tất cả review của một user
// GET /api/reviews/user/:user_id
router.get("/user/:user_id", reviewController.getReviewsByUser);

// ============ PROTECTED ROUTES (cần đăng nhập) ============

// Tạo review mới
// POST /api/reviews
// Body: { place_id, rating, facilities }
router.post("/", authMiddleware.requireAuth, reviewController.createReview);

// Lấy review của user cho 1 place cụ thể
// GET /api/reviews/my-review/:place_id
router.get(
  "/my-review/:place_id",
  authMiddleware.requireAuth,
  reviewController.getUserReviewForPlace
);

// Cập nhật review
// PUT /api/reviews/:id
// Body: { rating, facilities }
router.put("/:id", authMiddleware.requireAuth, reviewController.updateReview);

// Xóa review
// DELETE /api/reviews/:id
router.delete(
  "/:id",
  authMiddleware.requireAuth,
  reviewController.deleteReview
);

module.exports = router;
