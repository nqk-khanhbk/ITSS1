const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    place_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true
    },
    rating: { type: Number, required: true },
    comment: String
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

const Review = mongoose.model("Review", reviewSchema, "reviews");

module.exports = Review;
