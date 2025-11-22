const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const db = require("../config/database");
const User = require("../models/user.model");
const Category = require("../models/category.model");
const Place = require("../models/place.model");
const Review = require("../models/review.model");
const Event = require("../models/event.model");
const Favorite = require("../models/favorite.model");
const DayPlan = require("../models/dayPlan.model");

const categoriesData = [
  { name: "Công viên & Hồ", icon: "park" },
  { name: "Văn hóa & Lịch sử", icon: "history_edu" },
  { name: "Ẩm thực & Giải trí", icon: "restaurant" },
  { name: "Mua sắm & Chợ đêm", icon: "local_mall" },
  { name: "Chụp ảnh & Nghệ thuật", icon: "camera_alt" }
];

const placeSeeds = [
  {
    name: "Hồ Hoàn Kiếm",
    description: "Biểu tượng của Hà Nội, phù hợp để dạo bộ, chụp ảnh và ăn vặt buổi tối",
    address: "Đường Đinh Tiên Hoàng, quận Hoàn Kiếm",
    city: "Hà Nội",
    area: "Hoàn Kiếm",
    location: {
      type: "Point",
      coordinates: [105.851, 21.028]
    },
    opening_hours: {
      mon: "05:00 - 22:00",
      tue: "05:00 - 22:00",
      wed: "05:00 - 22:00",
      thu: "05:00 - 22:00",
      fri: "05:00 - 23:00",
      sat: "05:00 - 23:00",
      sun: "05:00 - 22:00"
    },
    price_range: "Miễn phí",
    categoryKey: "Công viên & Hồ",
    images: [
      { url: "https://images.unsplash.com/photo-1569329502714-bf9dc298214a?w=600", alt_text: "Bình minh tại Hồ Gươm" },
      { url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600", alt_text: "Tháp Rùa bóng tối" }
    ],
    age_limit: { min: 0, max: 0 }
  },
  {
    name: "Phố Cổ Hà Nội",
    description: "36 phố phường cổ kính đầy sắc màu, phù hợp đi bộ, ăn uống và mua sắm đồ lưu niệm",
    address: "Phố Hàng Đào - Hàng Ngang",
    city: "Hà Nội",
    area: "Hoàn Kiếm",
    location: {
      type: "Point",
      coordinates: [105.85, 21.03]
    },
    opening_hours: {
      mon: "07:00 - 23:00",
      tue: "07:00 - 23:00",
      wed: "07:00 - 23:00",
      thu: "07:00 - 23:00",
      fri: "07:00 - 23:30",
      sat: "07:00 - 23:30",
      sun: "07:00 - 23:00"
    },
    price_range: "0đ - 200.000đ",
    categoryKey: "Văn hóa & Lịch sử",
    images: [
      { url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600", alt_text: "Khu phố cổ náo nhiệt" },
      { url: "https://images.unsplash.com/photo-1473643068425-27471ccc72a0?w=600", alt_text: "Ngõ nhỏ Hà Nội" }
    ]
  },
  {
    name: "Công viên Thống Nhất",
    description: "Trung tâm giải trí lớn, có hồ nước, đài phun nước và nhiều hoạt động ngoài trời",
    address: "Phố Trần Nhân Tông",
    city: "Hà Nội",
    area: "Hai Bà Trưng",
    location: {
      type: "Point",
      coordinates: [105.84, 21.01]
    },
    opening_hours: {
      mon: "05:30 - 22:00",
      tue: "05:30 - 22:00",
      wed: "05:30 - 22:00",
      thu: "05:30 - 22:00",
      fri: "05:30 - 23:00",
      sat: "05:30 - 23:00",
      sun: "05:30 - 22:00"
    },
    price_range: "Miễn phí",
    categoryKey: "Công viên & Hồ",
    images: [
      { url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600", alt_text: "Lối đi trong công viên" },
      { url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600", alt_text: "Hồ nước xanh" }
    ]
  },
  {
    name: "Bảo tàng Dân tộc học",
    description: "Sưu tập phong phú về đời sống văn hóa 54 dân tộc Việt Nam",
    address: "Ngõ 1 Nguyễn Văn Huyên",
    city: "Hà Nội",
    area: "Cầu Giấy",
    location: {
      type: "Point",
      coordinates: [105.81, 21.03]
    },
    opening_hours: {
      mon: "08:00 - 17:00",
      tue: "08:00 - 17:00",
      wed: "08:00 - 17:00",
      thu: "08:00 - 17:00",
      fri: "08:00 - 17:00",
      sat: "08:00 - 17:00",
      sun: "08:00 - 17:00"
    },
    price_range: "80.000đ",
    categoryKey: "Văn hóa & Lịch sử",
    images: [
      { url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600", alt_text: "Không gian bảo tàng" },
      { url: "https://images.unsplash.com/photo-1508255132410-4e89f5d2d5b7?w=600", alt_text: "Làng dân tộc" }
    ],
    age_limit: { min: 6, max: 70 }
  },
  {
    name: "Hẻm ẩm thực Tống Duy Tân",
    description: "Chuỗi quán ăn đường phố đúng điệu, chạy dài suốt ngày và đêm",
    address: "Tống Duy Tân, Hoàn Kiếm",
    city: "Hà Nội",
    area: "Hoàn Kiếm",
    location: {
      type: "Point",
      coordinates: [105.85, 21.03]
    },
    opening_hours: {
      mon: "10:00 - 01:00",
      tue: "10:00 - 01:00",
      wed: "10:00 - 01:00",
      thu: "10:00 - 01:00",
      fri: "10:00 - 02:00",
      sat: "10:00 - 02:00",
      sun: "10:00 - 01:00"
    },
    price_range: "50.000đ - 180.000đ",
    categoryKey: "Ẩm thực & Giải trí",
    images: [
      { url: "https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=600", alt_text: "Đèn lồng và hàng quán" },
      { url: "https://images.unsplash.com/photo-1524592095937-2d3f34ffb8a0?w=600", alt_text: "Đĩa đặc sản phố" }
    ]
  },
  {
    name: "Phố đi bộ Nguyễn Huệ",
    description: "Không gian hiện đại, thường xuyên có sự kiện âm nhạc, nghệ thuật và triển lãm ảnh",
    address: "Đường Nguyễn Huệ, TP. Hồ Chí Minh",
    city: "Hà Nội",
    area: "Hoàn Kiếm",
    location: {
      type: "Point",
      coordinates: [105.85, 21.03]
    },
    opening_hours: {
      mon: "07:00 - 23:00",
      tue: "07:00 - 23:00",
      wed: "07:00 - 23:00",
      thu: "07:00 - 23:00",
      fri: "07:00 - 23:30",
      sat: "07:00 - 23:30",
      sun: "07:00 - 23:00"
    },
    price_range: "Miễn phí",
    categoryKey: "Chụp ảnh & Nghệ thuật",
    images: [
      { url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600", alt_text: "Dãy cây ép sáng" },
      { url: "https://images.unsplash.com/photo-1497493292307-31c376b6e479?w=600", alt_text: "Trình diễn âm nhạc" }
    ]
  }
];

(async function seed() {
  try {
    await db.connect();
    console.log("Xóa dữ liệu cũ...");
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Place.deleteMany({}),
      Review.deleteMany({}),
      Event.deleteMany({}),
      Favorite.deleteMany({}),
      DayPlan.deleteMany({})
    ]);

    const passwordHash = await bcrypt.hash("weekend2025", 10);
    const insertedUsers = await User.insertMany([
      { fullName: "Nguyễn Lan", email: "lan@weekend.vn", password: passwordHash, phone: "0393211122" },
      { fullName: "Trần Bảo Ngọc", email: "ngoc@weekend.vn", password: passwordHash, phone: "0912345566" }
    ]);

    const insertedCategories = await Category.insertMany(categoriesData);
    const categoryMap = insertedCategories.reduce((acc, cat) => {
      acc[cat.name] = cat._id;
      return acc;
    }, {});

    const placeInputs = placeSeeds.map(({ categoryKey, ...rest }) => ({
      ...rest,
      category_id: categoryMap[categoryKey]
    }));

    const insertedPlaces = await Place.insertMany(placeInputs);
    const placeMap = insertedPlaces.reduce((acc, place) => {
      acc[place.name] = place._id;
      return acc;
    }, {});

    const reviewSeeds = [
      {
        user_id: insertedUsers[0]._id,
        place_id: placeMap["Hồ Hoàn Kiếm"],
        rating: 5,
        comment: "Không thể thiếu trong mọi kế hoạch cuối tuần, cộng đồng ở đây lúc nào cũng sôi nổi!"
      },
      {
        user_id: insertedUsers[1]._id,
        place_id: placeMap["Phố Cổ Hà Nội"],
        rating: 4,
        comment: "Ăn uống và mua sắm dễ dàng, trừ việc hơi đông cuối tuần"
      },
      {
        user_id: insertedUsers[0]._id,
        place_id: placeMap["Công viên Thống Nhất"],
        rating: 4.5,
        comment: "Có không gian rộng để chạy bộ, tối có sự kiện âm nhạc nhỏ"
      }
    ];
    await Review.insertMany(reviewSeeds);

    const eventSeeds = [
      {
        place_id: placeMap["Phố Cổ Hà Nội"],
        title: "Lễ hội đèn lồng",
        description: "Trưng bày đèn lồng handmade dọc phố Hàng Mã",
        start_time: new Date("2025-12-05T18:00:00"),
        end_time: new Date("2025-12-07T23:00:00")
      },
      {
        place_id: placeMap["Hẻm ẩm thực Tống Duy Tân"],
        title: "Food tour đêm cuối tuần",
        description: "Từng quán ăn giới thiệu đặc sản Hà Nội",
        start_time: new Date("2025-11-29T19:00:00"),
        end_time: new Date("2025-11-29T23:30:00")
      }
    ];
    await Event.insertMany(eventSeeds);

    const favoriteSeeds = [
      { user_id: insertedUsers[0]._id, place_id: placeMap["Hồ Hoàn Kiếm"] },
      { user_id: insertedUsers[0]._id, place_id: placeMap["Công viên Thống Nhất"] },
      { user_id: insertedUsers[1]._id, place_id: placeMap["Hẻm ẩm thực Tống Duy Tân"] }
    ];
    await Favorite.insertMany(favoriteSeeds);

    const dayPlanSeeds = [
      {
        user_id: insertedUsers[0]._id,
        title: "Hà Nội cổ điển",
        description: "Dạo bộ Hồ Gươm, ăn trưa phố cổ và chụp ảnh tại bảo tàng",
        date: new Date("2025-11-29"),
        cover_image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
        tags: ["phố cổ", "ẩm thực", "chụp hình"],
        items: [
          {
            id: new mongoose.Types.ObjectId(),
            place_id: placeMap["Hồ Hoàn Kiếm"],
            custom_place_name: "Hồ Gươm buổi sáng",
            start_time: "07:00",
            end_time: "08:30",
            link: "https://maps.app.goo.gl/hoan-kiem",
            image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
            note: "Tham quan và chơi đùa bên hồ",
            caution: "Tránh giờ cao điểm",
            transport: "Đi bộ",
            cost: "0đ",
            sort_order: 1
          },
          {
            id: new mongoose.Types.ObjectId(),
            place_id: placeMap["Phố Cổ Hà Nội"],
            custom_place_name: "Ăn trưa phố cổ",
            start_time: "12:00",
            end_time: "14:00",
            link: "https://maps.app.goo.gl/pho-co",
            image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
            note: "Thử bánh cuốn, phở gánh",
            caution: "Giữ đồ cá nhân cẩn thận",
            transport: "Xe điện vintage",
            cost: "120.000đ",
            sort_order: 2
          },
          {
            id: new mongoose.Types.ObjectId(),
            place_id: placeMap["Bảo tàng Dân tộc học"],
            custom_place_name: "Trong giờ chiều",
            start_time: "15:00",
            end_time: "17:00",
            link: "https://maps.app.goo.gl/bao-tang",
            image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800",
            note: "Chụp ảnh nhà truyền thống",
            caution: "Mang nước uống",
            transport: "Grab",
            cost: "80.000đ",
            sort_order: 3
          }
        ]
      },
      {
        user_id: insertedUsers[1]._id,
        title: "Công viên & ẩm thực đêm",
        description: "Chạy bộ ở công viên, cuối cùng là hẻm ăn uống linh đình",
        date: new Date("2025-12-06"),
        cover_image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800",
        tags: ["chạy bộ", "ăn đêm"],
        items: [
          {
            id: new mongoose.Types.ObjectId(),
            place_id: placeMap["Công viên Thống Nhất"],
            custom_place_name: "Đạp xe sáng",
            start_time: "06:30",
            end_time: "08:00",
            link: "https://maps.app.goo.gl/cong-vien",
            image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
            note: "Thuê xe đạp công viên",
            caution: "Mang theo áo khoác",
            transport: "Xe đạp",
            cost: "30.000đ",
            sort_order: 1
          },
          {
            id: new mongoose.Types.ObjectId(),
            place_id: placeMap["Hẻm ẩm thực Tống Duy Tân"],
            custom_place_name: "Ăn tối phong cách",
            start_time: "19:00",
            end_time: "21:00",
            link: "https://maps.app.goo.gl/hem-am-thuc",
            image: "https://images.unsplash.com/photo-1524592095937-2d3f34ffb8a0?w=800",
            note: "Ăn vặt và nhâm nhi trà chanh",
            caution: "Tránh để bị chặt chém",
            transport: "Đi bộ",
            cost: "160.000đ",
            sort_order: 2
          }
        ]
      }
    ];
    await DayPlan.insertMany(dayPlanSeeds);

    console.log("Seed dữ liệu hoàn tất.");
  } catch (error) {
    console.error("Seed thất bại", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();
