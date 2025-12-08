const express = require("express");
const router = express.Router();
const controllers = require("../controllers/dayPlan.controller");
const multer = require("multer");
const uploadNone = multer().none();

// ============ ROUTES CHO FAVORITES/LIKES ============

// Lấy danh sách kế hoạch yêu thích của user
// GET /api/day-plans/favorites?user_id=xxx
router.get("/favorites", controllers.getFavoriteDayPlans);

// Kiểm tra đã yêu thích kế hoạch chưa
// GET /api/day-plans/likes/check/:day_plan_id?user_id=xxx
router.get("/likes/check/:day_plan_id", controllers.checkLikeDayPlan);

// Thêm kế hoạch vào yêu thích
// POST /api/day-plans/likes
// Body: { user_id, day_plan_id }
router.post("/likes", controllers.likeDayPlan);

// Xóa kế hoạch khỏi yêu thích
// DELETE /api/day-plans/likes/:day_plan_id?user_id=xxx
router.delete("/likes/:day_plan_id", controllers.unlikeDayPlan);

// ============ ROUTES CHÍNH ============

// Lấy danh sách day plans
router.get("/", uploadNone, controllers.list);

// Lấy chi tiết day plan
router.get("/:id", uploadNone, controllers.detail);

module.exports = router;
