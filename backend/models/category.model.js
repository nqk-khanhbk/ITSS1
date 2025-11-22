const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    icon: { type: String, default: "" },
  },
  { timestamps: false }
);

const Category = mongoose.model("Category", categorySchema, "categories");

module.exports = Category;
