const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const db = require("../config/database");
const Review = require("../models/review.model");

/**
 * Script để thêm trường facilities vào các review records có sẵn
 * Chạy: node backend/scripts/migrate-review-facilities.js
 */

// Dữ liệu facilities mẫu ngẫu nhiên để phân phối
const getFacilitiesData = () => {
  const options = ["yes", "no", "unknown"];

  // Random với phân phối: 40% yes, 30% no, 30% unknown
  const getRandomValue = () => {
    const rand = Math.random();
    if (rand < 0.4) return "yes";
    if (rand < 0.7) return "no";
    return "unknown";
  };

  return {
    parking: getRandomValue(),
    restroom: getRandomValue(),
    diaper_changing: getRandomValue(),
    parent_rest_area: getRandomValue(),
    dining_area: getRandomValue(),
    stroller_support: getRandomValue(),
    medical_room: getRandomValue(),
    air_conditioning: getRandomValue(),
    wifi: getRandomValue(),
    disability_access: getRandomValue(),
    locker: getRandomValue(),
    safe_zone: getRandomValue(),
  };
};

const migrateReviewFacilities = async () => {
  try {
    console.log("🚀 Bắt đầu migration facilities cho reviews...");

    // Kết nối database
    await db.connect();

    // Lấy tất cả reviews chưa có facilities hoặc facilities rỗng
    const reviews = await Review.find({
      $or: [
        { facilities: { $exists: false } },
        { facilities: null },
        { facilities: {} },
      ],
    });

    console.log(`📊 Tìm thấy ${reviews.length} reviews cần cập nhật`);

    if (reviews.length === 0) {
      console.log("✅ Không có review nào cần cập nhật");
      process.exit(0);
    }

    // Cập nhật từng review
    let updatedCount = 0;
    for (const review of reviews) {
      const facilitiesData = getFacilitiesData();

      await Review.findByIdAndUpdate(review._id, {
        $set: { facilities: facilitiesData },
      });

      updatedCount++;

      if (updatedCount % 10 === 0) {
        console.log(
          `⏳ Đã cập nhật ${updatedCount}/${reviews.length} reviews...`
        );
      }
    }

    console.log(
      `✅ Hoàn thành! Đã cập nhật ${updatedCount} reviews với dữ liệu facilities`
    );

    // Hiển thị sample
    const sampleReview = await Review.findOne({ facilities: { $exists: true } })
      .select("rating facilities")
      .lean();

    console.log("\n📝 Sample review với facilities:");
    console.log(JSON.stringify(sampleReview, null, 2));

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi migration:", error);
    process.exit(1);
  }
};

// Chạy migration
migrateReviewFacilities();
