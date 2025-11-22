const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
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
    }
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

const Favorite = mongoose.model("Favorite", favoriteSchema, "favorites");

module.exports = Favorite;
