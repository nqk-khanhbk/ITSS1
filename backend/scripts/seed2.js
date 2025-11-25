const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const db = require("../config/database");
const User = require("../models/user.model");
const DayPlan = require("../models/dayPlan.model");
const Like = require("../models/like.model");

(async function seedLikes() {
  try {
    await db.connect();
    console.log("Bắt đầu seed bảng likes...");

    // Xóa dữ liệu cũ của bảng likes
    await Like.deleteMany({});
    console.log("Đã xóa dữ liệu likes cũ");

    // Lấy users và day plans có sẵn
    const users = await User.find({}).limit(10);
    const dayPlans = await DayPlan.find({}).limit(10);

    if (users.length === 0 || dayPlans.length === 0) {
      console.log(
        "Không tìm thấy users hoặc day plans. Vui lòng chạy seed.js trước."
      );
      process.exit(0);
    }

    console.log(
      `Tìm thấy ${users.length} users và ${dayPlans.length} day plans`
    );

    // Tạo likes
    const likeSeeds = [];

    // Mỗi user like một số day plans ngẫu nhiên (không like day plan của chính mình)
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      // Chọn 1-3 day plans ngẫu nhiên để like (không phải của chính mình)
      const numLikes = Math.floor(Math.random() * 3) + 1;
      const otherPlans = dayPlans.filter(
        (plan) =>
          plan.user_id && plan.user_id.toString() !== user._id.toString()
      );

      const shuffled = otherPlans.sort(() => 0.5 - Math.random());
      const selectedPlans = shuffled.slice(
        0,
        Math.min(numLikes, otherPlans.length)
      );

      for (const plan of selectedPlans) {
        likeSeeds.push({
          user_id: user._id,
          day_plan_id: plan._id,
        });
      }
    }

    if (likeSeeds.length > 0) {
      await Like.insertMany(likeSeeds);
      console.log(`Đã thêm ${likeSeeds.length} likes thành công`);
    } else {
      console.log("Không có likes nào được tạo");
    }

    console.log("Seed bảng likes hoàn tất.");
  } catch (error) {
    console.error("Seed likes thất bại:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();
