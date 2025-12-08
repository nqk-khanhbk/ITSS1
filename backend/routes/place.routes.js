const express = require("express");
const router = express.Router();
const placeController = require("../controllers/place.controller");

// 1. Route lấy danh sách filter options
// URL: /api/places/filters
router.get("/filters", placeController.getFilterOptions);

// 2. Route tìm kiếm
// URL: /api/places/search
router.get("/search", placeController.searchPlaces);

// 3. Route bảng xếp hạng
// URL: /api/places/ranking
router.get("/ranking", placeController.getPlacesRanking);

// 4. Route lấy chi tiết (Dynamic route - Đặt SAU CÙNG)
// URL: /api/places/:id
router.get("/:id", placeController.getPlaceDetail);

module.exports = router;