const mongoose = require("mongoose");

const facilitiesSchema = new mongoose.Schema(
  {
    parking: {
      type: String,
      enum: ["yes", "no", "unknown"],
      default: "unknown",
    }, // Có nhà để xe
    restroom: {
      type: String,
      enum: ["yes", "no", "unknown"],
      default: "unknown",
    }, // Nhà vệ sinh
    diaper_changing: {
      type: String,
      enum: ["yes", "no", "unknown"],
      default: "unknown",
    }, // Khu thay tã
    parent_rest_area: {
      type: String,
      enum: ["yes", "no", "unknown"],
      default: "unknown",
    }, // Khu nghỉ / quán cà phê dành cho phụ huynh
    dining_area: {
      type: String,
      enum: ["yes", "no", "unknown"],
      default: "unknown",
    }, // Nhà hàng / khu ăn uống
    stroller_support: {
      type: String,
      enum: ["yes", "no", "unknown"],
      default: "unknown",
    }, // Hỗ trợ xe đẩy cho bé
    medical_room: {
      type: String,
      enum: ["yes", "no", "unknown"],
      default: "unknown",
    }, // Phòng y tế
    air_conditioning: {
      type: String,
      enum: ["yes", "no", "unknown"],
      default: "unknown",
    }, // Điều hòa
    wifi: { type: String, enum: ["yes", "no", "unknown"], default: "unknown" }, // Wi-Fi
    disability_access: {
      type: String,
      enum: ["yes", "no", "unknown"],
      default: "unknown",
    }, // Lối đi cho người khuyết tật
    locker: {
      type: String,
      enum: ["yes", "no", "unknown"],
      default: "unknown",
    }, // Khu để đồ / tủ khóa
    safe_zone: {
      type: String,
      enum: ["yes", "no", "unknown"],
      default: "unknown",
    }, // Khu vực an toàn cho trẻ
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    place_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
    rating: { type: Number, required: true },
    facilities: {
      type: facilitiesSchema,
      default: () => ({}),
    }, // Đánh giá cơ sở vật chất
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

const Review = mongoose.model("Review", reviewSchema, "reviews");

module.exports = Review;
