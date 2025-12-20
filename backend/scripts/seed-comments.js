const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const db = require("../config/database");
const Comment = require("../models/comment.model");
const Review = require("../models/review.model");
const User = require("../models/user.model");
const Place = require("../models/place.model");

/**
 * Script để sinh dữ liệu comment cho các review có sẵn
 * Chạy: node backend/scripts/seed-comments.js
 */

// Mảng nội dung comment mẫu
const commentTemplates = [
  "Cảm ơn bạn đã chia sẻ! Thông tin rất hữu ích.",
  "Mình cũng đã từng đến đây, đồng ý với đánh giá của bạn!",
  "Địa điểm này có thích hợp cho trẻ nhỏ không nhỉ?",
  "Bạn đi vào ngày nào vậy? Đông người không?",
  "Mình đang cân nhắc đưa gia đình đến đây, cảm ơn review của bạn!",
  "Giá vé bao nhiêu vậy bạn?",
  "Có chỗ đỗ xe không bạn?",
  "Đồ ăn ở đó thế nào?",
  "Cảnh đẹp quá! Mình cũng muốn đến thử.",
  "Có nên đặt vé trước không bạn?",
  "Thời gian nào đi là đẹp nhất?",
  "Bạn có ảnh nào khác không?",
  "Tuyệt vời! Thêm vào danh sách must-go luôn.",
  "Trẻ em có vào miễn phí không?",
  "Có wifi không bạn?",
  "Địa điểm này mở cửa đến mấy giờ?",
  "Bạn đi bằng phương tiện gì vậy?",
  "Có tour hướng dẫn không?",
  "Mình nghĩ sẽ rất vui nếu đi cùng bạn bè.",
  "Cảm ơn thông tin chi tiết của bạn!",
  "Có phù hợp cho người lớn tuổi không?",
  "Nhà vệ sinh có sạch sẽ không?",
  "Khu vực này có an toàn không bạn?",
  "Nên mang theo gì khi đến đây?",
  "Cảm ơn đã review chi tiết vậy!",
];

// Hàm random comment từ templates
const getRandomComment = () => {
  return commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
};

// Hàm random số lượng comment cho mỗi review (0-5 comments)
const getRandomCommentCount = () => {
  const rand = Math.random();
  if (rand < 0.3) return 0; // 30% không có comment
  if (rand < 0.5) return 1; // 20% có 1 comment
  if (rand < 0.7) return 2; // 20% có 2 comments
  if (rand < 0.85) return 3; // 15% có 3 comments
  if (rand < 0.95) return 4; // 10% có 4 comments
  return 5; // 5% có 5 comments
};

const seedComments = async () => {
  try {
    console.log("🚀 Bắt đầu seed comments...");

    // Kết nối database
    await db.connect();

    // Xóa tất cả comments cũ
    await Comment.deleteMany({});
    console.log("🗑️  Đã xóa tất cả comments cũ");

    // Lấy tất cả users, places và reviews
    const users = await User.find().select("_id");
    const places = await Place.find().select("_id");
    const reviews = await Review.find().populate("place_id", "_id");

    if (users.length === 0 || places.length === 0 || reviews.length === 0) {
      console.log(
        "⚠️  Không tìm thấy đủ dữ liệu (users, places, reviews) để seed comments"
      );
      process.exit(1);
    }

    console.log(
      `📊 Tìm thấy: ${users.length} users, ${places.length} places, ${reviews.length} reviews`
    );

    let totalComments = 0;
    const commentsToInsert = [];

    // Tạo comments cho mỗi review
    for (const review of reviews) {
      const commentCount = getRandomCommentCount();

      for (let i = 0; i < commentCount; i++) {
        // Random user để comment (không phải là người tạo review)
        const randomUser = users[Math.floor(Math.random() * users.length)];

        const comment = {
          review_id: review._id,
          user_id: randomUser._id,
          place_id: review.place_id._id,
          content: getRandomComment(),
          created_at: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ), // Random trong 30 ngày qua
        };

        commentsToInsert.push(comment);
        totalComments++;
      }
    }

    // Insert tất cả comments
    if (commentsToInsert.length > 0) {
      await Comment.insertMany(commentsToInsert);
      console.log(`✅ Đã tạo ${totalComments} comments thành công!`);

      // Thống kê
      const reviewsWithComments = await Review.aggregate([
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "review_id",
            as: "comments",
          },
        },
        {
          $project: {
            commentCount: { $size: "$comments" },
          },
        },
        {
          $group: {
            _id: "$commentCount",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      console.log("\n📈 Thống kê:");
      reviewsWithComments.forEach((stat) => {
        console.log(`   - ${stat.count} reviews có ${stat._id} comment(s)`);
      });

      // Hiển thị sample
      const sampleComments = await Comment.find()
        .populate("user_id", "fullName")
        .populate("review_id")
        .limit(3)
        .lean();

      console.log("\n📝 Sample comments:");
      sampleComments.forEach((comment, index) => {
        console.log(
          `\n${index + 1}. User: ${comment.user_id?.fullName || "Unknown"}`
        );
        console.log(`   Content: "${comment.content}"`);
        console.log(`   Review ID: ${comment.review_id?._id}`);
      });
    } else {
      console.log("⚠️  Không có comment nào được tạo");
    }

    console.log("\n✨ Seed comments hoàn thành!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi seed comments:", error);
    process.exit(1);
  }
};

// Chạy seed
seedComments();
