const mongoose = require("mongoose");

const openingHoursSchema = new mongoose.Schema(
  {
    mon: String,
    tue: String,
    wed: String,
    thu: String,
    fri: String,
    sat: String,
    sun: String
  },
  { _id: false }
);

const imageSchema = new mongoose.Schema(
  {
    url: String,
    alt_text: String
  },
  { _id: false }
);

const ageLimitSchema = new mongoose.Schema(
  {
    min: Number,
    max: Number
  },
  { _id: false }
);

const placeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    address: String,
    city: String,
    area: String,
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        index: "2dsphere"
      }
    },
    opening_hours: openingHoursSchema,
    price_range: String,
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
    images: [imageSchema],
    age_limit: ageLimitSchema
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

const Place = mongoose.model("Place", placeSchema, "places");

module.exports = Place;
