const mongoose = require("mongoose");
const Review = require("../models/review.model");
const Place = require("../models/place.model");
const User = require("../models/user.model");

// ============ HELPER: Cập nhật rating của Place ============
const updatePlaceRating = async (placeId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { place_id: new mongoose.Types.ObjectId(placeId) } },
      {
        $group: {
          _id: "$place_id",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      // Format rating: 4 -> 4.0
      const avgRating = parseFloat(stats[0].avgRating.toFixed(1));
      await Place.updateOne(
        { _id: placeId },
        {
          $set: {
            avg_rating: avgRating,
            total_reviews: stats[0].count,
          },
        }
      );
    } else {
      // Không còn review nào -> reset về 0
      await Place.updateOne(
        { _id: placeId },
        {
          $set: {
            avg_rating: 0,
            total_reviews: 0,
          },
        }
      );
    }

    return true;
  } catch (error) {
    console.error("Error updating place rating:", error);
    return false;
  }
};

// ============ LẤY THỐNG KÊ REVIEW THEO PLACE ============
exports.getReviewStatsByPlace = async (req, res) => {
  try {
    const { place_id } = req.params;

    // Kiểm tra place tồn tại
    const place = await Place.findById(place_id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa điểm",
      });
    }

    // Lấy tất cả reviews của place
    const reviews = await Review.find({ place_id: place_id });

    if (reviews.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalReviews: 0,
          avgRating: 0,
          ratingDistribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
          },
          facilitiesStats: {},
        },
      });
    }

    // Tính sao trung bình
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = parseFloat((totalRating / reviews.length).toFixed(1));

    // Tính phân bố rating (5, 4, 3, 2, 1 sao)
    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((review) => {
      const roundedRating = Math.round(review.rating);
      if (roundedRating >= 1 && roundedRating <= 5) {
        ratingDistribution[roundedRating]++;
      }
    });

    // Thống kê facilities (yes, no, unknown)
    const facilitiesKeys = [
      "parking",
      "restroom",
      "diaper_changing",
      "parent_rest_area",
      "dining_area",
      "stroller_support",
      "medical_room",
      "air_conditioning",
      "wifi",
      "disability_access",
      "locker",
      "safe_zone",
    ];

    const facilitiesStats = {};
    facilitiesKeys.forEach((key) => {
      facilitiesStats[key] = {
        yes: 0,
        no: 0,
        unknown: 0,
      };
    });

    reviews.forEach((review) => {
      if (review.facilities) {
        facilitiesKeys.forEach((key) => {
          const value = review.facilities[key] || "unknown";
          if (facilitiesStats[key][value] !== undefined) {
            facilitiesStats[key][value]++;
          }
        });
      } else {
        // Nếu review không có facilities, tính là unknown
        facilitiesKeys.forEach((key) => {
          facilitiesStats[key].unknown++;
        });
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalReviews: reviews.length,
        avgRating: avgRating,
        ratingDistribution: ratingDistribution,
        facilitiesStats: facilitiesStats,
      },
    });
  } catch (error) {
    console.error("Get Review Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê đánh giá",
    });
  }
};

// ============ LẤY DANH SÁCH REVIEW THEO PLACE ============
exports.getReviewsByPlace = async (req, res) => {
  try {
    const { place_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ place_id: place_id })
      .populate("user_id", "fullName email avatar")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const total = await Review.countDocuments({ place_id: place_id });

    // Format rating trong response
    const formattedReviews = reviews.map((review) => ({
      ...review.toObject(),
      rating: parseFloat(review.rating).toFixed(1),
    }));

    res.status(200).json({
      success: true,
      data: formattedReviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get Reviews Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách bình luận",
    });
  }
};

// ============ TẠO REVIEW MỚI ============
exports.createReview = async (req, res) => {
  try {
    const { place_id, rating, facilities } = req.body;
    // Lấy user_id từ res.locals.user (đã được set bởi requireAuth middleware)
    const user_id = res.locals.user._id;

    // Validate
    if (!place_id || !rating) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp place_id và rating",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating phải từ 1 đến 5",
      });
    }

    // Kiểm tra place tồn tại
    const place = await Place.findById(place_id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa điểm",
      });
    }

    // Kiểm tra user đã review chưa (mỗi user chỉ được review 1 lần/place)
    const existingReview = await Review.findOne({ user_id, place_id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đánh giá địa điểm này rồi. Vui lòng sửa đánh giá cũ.",
      });
    }

    // Validate facilities nếu có
    if (facilities) {
      const validValues = ["yes", "no", "unknown"];
      const validKeys = [
        "parking",
        "restroom",
        "diaper_changing",
        "parent_rest_area",
        "dining_area",
        "stroller_support",
        "medical_room",
        "air_conditioning",
        "wifi",
        "disability_access",
        "locker",
        "safe_zone",
      ];

      for (const key in facilities) {
        if (!validKeys.includes(key)) {
          return res.status(400).json({
            success: false,
            message: `Trường facilities không hợp lệ: ${key}`,
          });
        }
        if (!validValues.includes(facilities[key])) {
          return res.status(400).json({
            success: false,
            message: `Giá trị facilities phải là yes, no hoặc unknown`,
          });
        }
      }
    }

    // Tạo review mới
    const reviewData = {
      user_id,
      place_id,
      rating,
    };

    if (facilities) {
      reviewData.facilities = facilities;
    }

    const newReview = await Review.create(reviewData);

    // Cập nhật rating của Place
    await updatePlaceRating(place_id);

    // Populate user info để trả về
    const populatedReview = await Review.findById(newReview._id)
      .populate("user_id", "fullName email avatar")
      .exec();

    res.status(201).json({
      success: true,
      message: "Đánh giá thành công",
      data: {
        ...populatedReview.toObject(),
        rating: parseFloat(populatedReview.rating).toFixed(1),
      },
    });
  } catch (error) {
    console.error("Create Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo đánh giá",
    });
  }
};

// ============ CẬP NHẬT REVIEW ============
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params; // Review ID
    const { rating, facilities } = req.body;
    // Lấy user_id từ res.locals.user (đã được set bởi requireAuth middleware)
    const user_id = res.locals.user._id;

    // Tìm review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá",
      });
    }

    // Kiểm tra quyền (chỉ owner mới được sửa)
    if (review.user_id.toString() !== user_id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền sửa đánh giá này",
      });
    }

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating phải từ 1 đến 5",
      });
    }

    // Validate facilities nếu có
    if (facilities) {
      const validValues = ["yes", "no", "unknown"];
      const validKeys = [
        "parking",
        "restroom",
        "diaper_changing",
        "parent_rest_area",
        "dining_area",
        "stroller_support",
        "medical_room",
        "air_conditioning",
        "wifi",
        "disability_access",
        "locker",
        "safe_zone",
      ];

      for (const key in facilities) {
        if (!validKeys.includes(key)) {
          return res.status(400).json({
            success: false,
            message: `Trường facilities không hợp lệ: ${key}`,
          });
        }
        if (!validValues.includes(facilities[key])) {
          return res.status(400).json({
            success: false,
            message: `Giá trị facilities phải là yes, no hoặc unknown`,
          });
        }
      }
    }

    // Cập nhật
    if (rating) review.rating = rating;
    if (facilities) {
      // Merge facilities: giữ các giá trị cũ, chỉ cập nhật các field mới
      review.facilities = { ...review.facilities.toObject(), ...facilities };
    }
    await review.save();

    // Cập nhật rating của Place
    await updatePlaceRating(review.place_id);

    // Populate và trả về
    const updatedReview = await Review.findById(id)
      .populate("user_id", "fullName email avatar")
      .exec();

    res.status(200).json({
      success: true,
      message: "Cập nhật đánh giá thành công",
      data: {
        ...updatedReview.toObject(),
        rating: parseFloat(updatedReview.rating).toFixed(1),
      },
    });
  } catch (error) {
    console.error("Update Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật đánh giá",
    });
  }
};

// ============ XÓA REVIEW ============
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    // Lấy user_id từ res.locals.user (đã được set bởi requireAuth middleware)
    const user_id = res.locals.user._id;

    // Tìm review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá",
      });
    }

    // Kiểm tra quyền
    if (review.user_id.toString() !== user_id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa đánh giá này",
      });
    }

    const placeId = review.place_id;

    // Xóa review
    await Review.deleteOne({ _id: id });

    // Cập nhật rating của Place
    await updatePlaceRating(placeId);

    res.status(200).json({
      success: true,
      message: "Xóa đánh giá thành công",
    });
  } catch (error) {
    console.error("Delete Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa đánh giá",
    });
  }
};

// ============ LẤY TẤT CẢ REVIEW CỦA USER ============
exports.getReviewsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Kiểm tra user tồn tại
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    const reviews = await Review.find({ user_id: user_id })
      .populate("place_id", "name address images")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const total = await Review.countDocuments({ user_id: user_id });

    // Format rating trong response
    const formattedReviews = reviews.map((review) => ({
      ...review.toObject(),
      rating: parseFloat(review.rating).toFixed(1),
    }));

    res.status(200).json({
      success: true,
      data: formattedReviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get Reviews By User Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách đánh giá của người dùng",
    });
  }
};

// ============ LẤY REVIEW CỦA USER CHO 1 PLACE ============
exports.getUserReviewForPlace = async (req, res) => {
  try {
    const { place_id } = req.params;
    // Lấy user_id từ res.locals.user (đã được set bởi requireAuth middleware)
    const user_id = res.locals.user._id;

    const review = await Review.findOne({ user_id, place_id })
      .populate("user_id", "fullName email avatar")
      .exec();

    if (!review) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "Bạn chưa đánh giá địa điểm này",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...review.toObject(),
        rating: parseFloat(review.rating).toFixed(1),
      },
    });
  } catch (error) {
    console.error("Get User Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy đánh giá",
    });
  }
};
