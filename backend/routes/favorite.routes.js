const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favorite.controller");

// Lấy danh sách yêu thích
// GET /api/favorites?user_id=xxx
router.get("/", favoriteController.getFavorites);

// Thêm vào yêu thích
// POST /api/favorites
// Body: { user_id, place_id }
router.post("/", favoriteController.addFavorite);

// Kiểm tra đã yêu thích chưa
// GET /api/favorites/check/:place_id?user_id=xxx
router.get("/check/:place_id", favoriteController.checkFavorite);

// Xóa khỏi yêu thích
// DELETE /api/favorites/:place_id?user_id=xxx
router.delete("/:place_id", favoriteController.removeFavorite);

module.exports = router;