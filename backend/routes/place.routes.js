const express = require("express");
const router = express.Router();
const placeController = require("../controllers/place.controller");

// 1. Route tìm kiếm (Static route - Phải đặt TRƯỚC dynamic route)
// URL: /api/places/search
router.get("/search", placeController.searchPlaces);

// 2. Route lấy chi tiết (Dynamic route - Đặt SAU)
// URL: /api/places/656... (ID của địa điểm)
router.get("/:id", placeController.getPlaceDetail);

module.exports = router;