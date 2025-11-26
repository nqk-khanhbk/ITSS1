const Review = require("../models/review.model");
// Cần import User để Mongoose hiểu khi populate (tránh lỗi MissingSchemaError)
const User = require("../models/user.model"); 

exports.getReviewsByPlace = async (req, res) => {
  try {
    const { place_id } = req.params; // Lấy ID địa điểm từ URL
    const { page = 1, limit = 10 } = req.query; // Phân trang

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 1. Lấy danh sách review
    const reviews = await Review.find({ place_id: place_id })
      // Populate: Join sang bảng User để lấy thông tin người bình luận
      // select: Chỉ lấy các trường cần thiết (tránh lộ password)
      // Bạn hãy kiểm tra model User của bạn, nếu có trường 'avatar' thì thêm vào đây nhé
      .populate("user_id", "fullName email avatar") 
      .sort({ created_at: -1 }) // Sắp xếp mới nhất lên đầu
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    // 2. Đếm tổng số review để làm phân trang
    const total = await Review.countDocuments({ place_id: place_id });

    // 3. Format lại dữ liệu trả về (nếu cần)
    // Ở đây tôi giữ nguyên cấu trúc, frontend sẽ truy cập vào .user_id.name
    
    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error("Get Reviews Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server khi lấy danh sách bình luận" 
    });
  }
};