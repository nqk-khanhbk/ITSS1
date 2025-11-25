const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const db = require("../config/database");
const DayPlan = require("../models/dayPlan.model");

async function migrateCostToPriceRange() {
  try {
    await db.connect();
    console.log("Bắt đầu migrate cost sang price_range...");

    const dayPlans = await DayPlan.find({});
    console.log(`Tìm thấy ${dayPlans.length} day plans`);

    let migratedCount = 0;

    for (const dp of dayPlans) {
      let modified = false;

      dp.items.forEach((item) => {
        // Nếu có trường cost, chuyển sang price_range
        if (item.cost !== undefined) {
          // Parse cost để lấy giá trị số
          const costStr = String(item.cost).replace(/[^\d]/g, ""); // Loại bỏ ký tự không phải số
          const costNum = parseInt(costStr) || 0;

          item.price_range = costStr ? `${costNum}đ` : "Miễn phí";

          // Xóa trường cost cũ
          item.cost = undefined;
          modified = true;
        }
      });

      if (modified) {
        await dp.save();
        migratedCount++;
        console.log(`✓ Migrated DayPlan: ${dp.title} (${dp._id})`);
      }
    }

    console.log(
      `\nMigration completed! ${migratedCount}/${dayPlans.length} day plans được cập nhật.`
    );
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

migrateCostToPriceRange();
