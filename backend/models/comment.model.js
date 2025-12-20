const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
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
    content: { type: String, required: true }, // Nội dung comment
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const Comment = mongoose.model("Comment", commentSchema, "comments");

module.exports = Comment;
