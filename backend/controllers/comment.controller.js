const mongoose = require("mongoose");
const Comment = require("../models/comment.model");
const Place = require("../models/place.model");

// ============ LẤY DANH SÁCH COMMENT THEO PLACE ============
exports.getCommentsByPlace = async (req, res) => {
  try {
    const { place_id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Kiểm tra place tồn tại
    const place = await Place.findById(place_id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa điểm",
      });
    }

    const comments = await Comment.find({ place_id: place_id })
      .populate("user_id", "fullName email avatar")
      .populate("review_id", "rating created_at")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const total = await Comment.countDocuments({ place_id: place_id });

    res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get Comments By Place Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách bình luận",
    });
  }
};

// ============ TẠO COMMENT MỚI ============
exports.createComment = async (req, res) => {
  try {
    const { place_id, content, review_id } = req.body;
    // Lấy user_id từ res.locals.user (đã được set bởi requireAuth middleware)
    const user_id = res.locals.user._id;

    // Validate
    if (!place_id || !content) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp place_id và content",
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nội dung bình luận không được để trống",
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

    // Tạo comment mới
    const commentData = {
      user_id,
      place_id,
      content: content.trim(),
    };

    // Nếu có review_id thì thêm vào
    if (review_id) {
      commentData.review_id = review_id;
    }

    const newComment = await Comment.create(commentData);

    // Populate user info để trả về
    const populatedComment = await Comment.findById(newComment._id)
      .populate("user_id", "fullName email avatar")
      .exec();

    res.status(201).json({
      success: true,
      message: "Tạo bình luận thành công",
      data: populatedComment,
    });
  } catch (error) {
    console.error("Create Comment Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo bình luận",
    });
  }
};

// ============ CẬP NHẬT COMMENT ============
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params; // Comment ID
    const { content } = req.body;
    // Lấy user_id từ res.locals.user (đã được set bởi requireAuth middleware)
    const user_id = res.locals.user._id;

    // Validate
    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp nội dung bình luận",
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nội dung bình luận không được để trống",
      });
    }

    // Tìm comment
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bình luận",
      });
    }

    // Kiểm tra quyền (chỉ owner mới được sửa)
    if (comment.user_id.toString() !== user_id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền sửa bình luận này",
      });
    }

    // Cập nhật
    comment.content = content.trim();
    await comment.save();

    // Populate user info để trả về
    const updatedComment = await Comment.findById(id)
      .populate("user_id", "fullName email avatar")
      .exec();

    res.status(200).json({
      success: true,
      message: "Cập nhật bình luận thành công",
      data: updatedComment,
    });
  } catch (error) {
    console.error("Update Comment Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật bình luận",
    });
  }
};

// ============ XÓA COMMENT ============
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    // Lấy user_id từ res.locals.user (đã được set bởi requireAuth middleware)
    const user_id = res.locals.user._id;

    // Tìm comment
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bình luận",
      });
    }

    // Kiểm tra quyền (chỉ owner mới được xóa)
    if (comment.user_id.toString() !== user_id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa bình luận này",
      });
    }

    // Xóa comment
    await Comment.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: "Xóa bình luận thành công",
    });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa bình luận",
    });
  }
};
