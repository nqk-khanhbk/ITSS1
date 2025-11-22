const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    place_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place"
    },
    custom_place_name: String,
    start_time: String,
    end_time: String,
    link: String,
    image: String,
    note: String,
    caution: String,
    transport: String,
    cost: String,
    sort_order: Number
  },
  { _id: true }
);

const dayPlanSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: { type: String, required: true },
    description: String,
    date: Date,
    cover_image: String,
    tags: [String],
    items: [itemSchema]
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

const DayPlan = mongoose.model("DayPlan", dayPlanSchema, "day_plans");

module.exports = DayPlan;
