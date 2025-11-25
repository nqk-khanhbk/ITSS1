const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    day_plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DayPlan",
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

// Tạo compound index để đảm bảo một user chỉ like một day plan một lần
likeSchema.index({ user_id: 1, day_plan_id: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema, "likes");

module.exports = Like;
