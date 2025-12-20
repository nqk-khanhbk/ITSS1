const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// ============ PUBLIC ROUTES ============

// Lấy danh sách comment theo địa điểm
// GET /api/comments/:place_id
router.get("/:place_id", commentController.getCommentsByPlace);

// ============ PROTECTED ROUTES (cần đăng nhập) ============

// Tạo comment mới cho địa điểm
// POST /api/comments
// Body: { place_id, content, review_id (optional) }
router.post("/", authMiddleware.requireAuth, commentController.createComment);

// Cập nhật comment của mình
// PUT /api/comments/:id
// Body: { content }
router.put("/:id", authMiddleware.requireAuth, commentController.updateComment);

// Xóa comment của mình
// DELETE /api/comments/:id
router.delete(
  "/:id",
  authMiddleware.requireAuth,
  commentController.deleteComment
);

module.exports = router;
