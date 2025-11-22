const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    place_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true
    },
    title: { type: String, required: true },
    description: String,
    start_time: Date,
    end_time: Date
  },
  { timestamps: false }
);

const Event = mongoose.model("Event", eventSchema, "events");

module.exports = Event;
