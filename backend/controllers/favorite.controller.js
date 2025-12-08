const mongoose = require("mongoose");
const Favorite = require("../models/favorite.model");
const Place = require("../models/place.model");

/**
 * Format rating luôn có 1 chữ số thập phân (4 -> "4.0")
 */
const formatRating = (rating) => {
  if (!rating && rating !== 0) return "0.0";
  return Number(rating).toFixed(1);
};

// ============ LẤY DANH SÁCH ĐỊA ĐIỂM YÊU THÍCH ============
exports.getFavorites = async (req, res) => {
  try {
    const { user_id, page = 1, limit = 10 } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp user_id"
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Lấy danh sách favorites của user, populate thông tin place
    const favorites = await Favorite.find({ user_id })
      .populate({
        path: "place_id",
        select: "name images description price_range avg_rating total_reviews"
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    // Đếm tổng số favorites
    const total = await Favorite.countDocuments({ user_id });

    // Format kết quả
    const formattedFavorites = favorites
      .filter(fav => fav.place_id) // Loại bỏ những place đã bị xóa
      .map(fav => {
        const place = fav.place_id;
        return {
          favorite_id: fav._id,
          place_id: place._id,
          name: place.name,
          images: place.images || [],
          description: place.description,
          price_range: place.price_range,
          rating: formatRating(place.avg_rating),
          total_reviews: place.total_reviews || 0,
          added_at: fav.created_at
        };
      });

    res.status(200).json({
      success: true,
      data: formattedFavorites,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error("Get Favorites Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách yêu thích"
    });
  }
};

// ============ THÊM ĐỊA ĐIỂM VÀO YÊU THÍCH ============
exports.addFavorite = async (req, res) => {
  try {
    const { user_id, place_id } = req.body;

    if (!user_id || !place_id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp user_id và place_id"
      });
    }

    // Kiểm tra place tồn tại
    const place = await Place.findById(place_id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa điểm"
      });
    }

    // Kiểm tra đã favorite chưa
    const existingFavorite = await Favorite.findOne({ user_id, place_id });
    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: "Địa điểm đã có trong danh sách yêu thích"
      });
    }

    // Tạo favorite mới
    const newFavorite = await Favorite.create({ user_id, place_id });

    res.status(201).json({
      success: true,
      message: "Đã thêm vào danh sách yêu thích",
      data: {
        favorite_id: newFavorite._id,
        place_id: place_id
      }
    });

  } catch (error) {
    console.error("Add Favorite Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm yêu thích"
    });
  }
};

// ============ XÓA ĐỊA ĐIỂM KHỎI YÊU THÍCH ============
exports.removeFavorite = async (req, res) => {
  try {
    const { place_id } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp user_id"
      });
    }

    const result = await Favorite.deleteOne({ user_id, place_id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy trong danh sách yêu thích"
      });
    }

    res.status(200).json({
      success: true,
      message: "Đã xóa khỏi danh sách yêu thích"
    });

  } catch (error) {
    console.error("Remove Favorite Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa yêu thích"
    });
  }
};

// ============ KIỂM TRA ĐỊA ĐIỂM ĐÃ ĐƯỢC YÊU THÍCH CHƯA ============
exports.checkFavorite = async (req, res) => {
  try {
    const { place_id } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp user_id"
      });
    }

    const favorite = await Favorite.findOne({ user_id, place_id });

    res.status(200).json({
      success: true,
      data: {
        is_favorite: !!favorite,
        favorite_id: favorite ? favorite._id : null
      }
    });

  } catch (error) {
    console.error("Check Favorite Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra yêu thích"
    });
  }
};