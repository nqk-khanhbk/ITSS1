const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const db = require("../config/database");
const Category = require("../models/category.model");
const Amenity = require("../models/amenity.model");
const Place = require("../models/place.model");
const User = require("../models/user.model");
const Review = require("../models/review.model");
const Favorite = require("../models/favorite.model");
const DayPlan = require("../models/dayPlan.model");
const Like = require("../models/like.model");

// ============ DỮ LIỆU CATEGORY ============
const categoriesData = [
  { name: "Khu vui chơi trong nhà", code: "indoor_playground", icon: "toys" },
  { name: "Công viên ngoài trời", code: "outdoor_park", icon: "park" },
  { name: "Sở thú", code: "zoo", icon: "pets" },
  { name: "Trang trại", code: "farm", icon: "agriculture" },
  { name: "Bảo tàng", code: "museum", icon: "museum" },
  { name: "Khu giáo dục", code: "education_center", icon: "school" },
  { name: "Trải nghiệm STEM", code: "stem_experience", icon: "science" },
  { name: "Khu thể thao", code: "sports_center", icon: "sports_soccer" },
  { name: "Khu vui chơi giải trí", code: "entertainment_center", icon: "attractions" },
  { name: "Quán cafe có khu chơi", code: "kid_friendly_cafe", icon: "local_cafe" },
];

// ============ DỮ LIỆU AMENITY ============
const amenitiesData = [
  { name: "Có nhà để xe", code: "parking", icon: "local_parking" },
  { name: "Nhà vệ sinh", code: "restroom", icon: "wc" },
  { name: "Khu thay tã", code: "diaper_changing", icon: "baby_changing_station" },
  { name: "Khu nghỉ cho phụ huynh", code: "parent_lounge", icon: "weekend" },
  { name: "Nhà hàng / khu ăn uống", code: "restaurant", icon: "restaurant" },
  { name: "Hỗ trợ xe đẩy cho bé", code: "stroller_friendly", icon: "stroller" },
  { name: "Phòng y tế", code: "first_aid", icon: "medical_services" },
  { name: "Điều hòa", code: "air_conditioning", icon: "ac_unit" },
  { name: "Wi-Fi", code: "wifi", icon: "wifi" },
  { name: "Lối đi cho người khuyết tật", code: "wheelchair_accessible", icon: "accessible" },
  { name: "Khu để đồ / tủ khóa", code: "lockers", icon: "lock" },
  { name: "Khu vực an toàn cho trẻ", code: "child_safe_area", icon: "child_care" },
];

// ============ DỮ LIỆU USER MẪU ============
const usersData = [
 {
  fullName: "Phạm Đức Long",
  email: "long.pham@gmail.com",
  password: "123456",
  phone: "0931122334",
  avatar: "https://randomuser.me/api/portraits/men/7.jpg"
},
{
  fullName: "Hoàng Thu Trang",
  email: "trang.hoang@gmail.com",
  password: "123456",
  phone: "0942233445",
  avatar: "https://randomuser.me/api/portraits/women/8.jpg"
},
{
  fullName: "Ngô Thành Nam",
  email: "nam.ngo@gmail.com",
  password: "123456",
  phone: "0953344556",
  avatar: "https://randomuser.me/api/portraits/men/9.jpg"
},
{
  fullName: "Bùi Mai Anh",
  email: "anh.bui@gmail.com",
  password: "123456",
  phone: "0964455667",
  avatar: "https://randomuser.me/api/portraits/women/10.jpg"
}

];

// ============ DỮ LIỆU PLACE ============
const placesData = [
  {
  name: "Kids City Vincom Bà Triệu",
  description: "Khu vui chơi trong nhà hiện đại với nhiều trò vận động và sáng tạo cho trẻ nhỏ",
  address: "Tầng 5, Vincom Bà Triệu",
  city: "Hà Nội",
  area: "Hai Bà Trưng",
  district: "Hai Bà Trưng",
  location: { type: "Point", coordinates: [105.8528, 21.0106] },
  opening_hours: {
    mon: "09:30-21:30", tue: "09:30-21:30", wed: "09:30-21:30",
    thu: "09:30-21:30", fri: "09:30-22:00", sat: "09:30-22:00", sun: "09:30-21:30"
  },
  open_on_holidays: true,
  price_range: "120.000đ - 220.000đ",
  min_price: 120000,
  max_price: 220000,
  categoryCode: "indoor_playground",
  amenityCodes: ["restroom", "air_conditioning", "wifi", "lockers", "child_safe_area"],
  images: [
    { url: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=600", alt_text: "Kids City Vincom" }
  ],
  age_limit: { min: 1, max: 10 },
  crowd_level: "high"
}, 

  {
  name: "Công viên Yên Sở",
  description: "Công viên ngoài trời rộng lớn, thích hợp cho dã ngoại và vui chơi gia đình",
  address: "Gamuda City, Hoàng Mai",
  city: "Hà Nội",
  area: "Hoàng Mai",
  district: "Hoàng Mai",
  location: { type: "Point", coordinates: [105.8719, 20.9631] },
  opening_hours: {
    mon: "05:00-22:00", tue: "05:00-22:00", wed: "05:00-22:00",
    thu: "05:00-22:00", fri: "05:00-22:00", sat: "05:00-22:00", sun: "05:00-22:00"
  },
  open_on_holidays: true,
  price_range: "Miễn phí",
  min_price: 0,
  max_price: 0,
  categoryCode: "outdoor_park",
  amenityCodes: ["parking", "restroom", "stroller_friendly"],
  images: [
    { url: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=600", alt_text: "Công viên Yên Sở" }
  ],
  age_limit: { min: 0, max: 99 },
  crowd_level: "medium"
}, 

 {
  name: "Robotics Lab Junior",
  description: "Trung tâm trải nghiệm robot và lập trình cơ bản cho trẻ em",
  address: "Tầng 4, Indochina Plaza Hà Nội",
  city: "Hà Nội",
  area: "Cầu Giấy",
  district: "Cầu Giấy",
  location: { type: "Point", coordinates: [105.7827, 21.0368] },
  opening_hours: {
    mon: "09:00-18:00", tue: "09:00-18:00", wed: "09:00-18:00",
    thu: "09:00-18:00", fri: "09:00-18:00", sat: "09:00-17:00", sun: "closed"
  },
  open_on_holidays: false,
  price_range: "250.000đ - 400.000đ",
  min_price: 250000,
  max_price: 400000,
  categoryCode: "stem_experience",
  amenityCodes: ["restroom", "air_conditioning", "wifi", "child_safe_area"],
  images: [
    { url: "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=600", alt_text: "Robotics Lab Junior" }
  ],
  age_limit: { min: 6, max: 14 },
  crowd_level: "low"
},
  {
  name: "Lala Cafe & Kids Zone",
  description: "Quán cafe thân thiện với gia đình, có khu vui chơi an toàn cho trẻ nhỏ",
  address: "45 Nguyễn Khang, Cầu Giấy",
  city: "Hà Nội",
  area: "Cầu Giấy",
  district: "Cầu Giấy",
  location: { type: "Point", coordinates: [105.7921, 21.0214] },
  opening_hours: {
    mon: "07:30-22:00", tue: "07:30-22:00", wed: "07:30-22:00",
    thu: "07:30-22:00", fri: "07:30-23:00", sat: "07:30-23:00", sun: "07:30-22:00"
  },
  open_on_holidays: true,
  price_range: "60.000đ - 180.000đ",
  min_price: 60000,
  max_price: 180000,
  categoryCode: "kid_friendly_cafe",
  amenityCodes: ["restroom", "diaper_changing", "parent_lounge", "wifi", "child_safe_area"],
  images: [
    { url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600", alt_text: "Lala Cafe Kids" }
  ],
  age_limit: { min: 1, max: 8 },
  crowd_level: "low"
},
 {
  name: "Bảo tàng Dân tộc học Việt Nam",
  description: "Bảo tàng giới thiệu văn hóa các dân tộc Việt Nam, có khu trải nghiệm ngoài trời cho trẻ",
  address: "Nguyễn Văn Huyên, Cầu Giấy",
  city: "Hà Nội",
  area: "Cầu Giấy",
  district: "Cầu Giấy",
  location: { type: "Point", coordinates: [105.8006, 21.0402] },
  opening_hours: {
    mon: "closed", tue: "08:30-17:30", wed: "08:30-17:30",
    thu: "08:30-17:30", fri: "08:30-17:30", sat: "08:30-17:30", sun: "08:30-17:30"
  },
  open_on_holidays: true,
  price_range: "40.000đ - 60.000đ",
  min_price: 40000,
  max_price: 60000,
  categoryCode: "museum",
  amenityCodes: ["restroom", "wheelchair_accessible", "stroller_friendly"],
  images: [
    { url: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=600", alt_text: "Bảo tàng Dân tộc học" }
  ],
  age_limit: { min: 5, max: 99 },
  crowd_level: "medium"
},
 
];

// ============ MAIN SEED FUNCTION ============
(async function seedAllData() {
  try {
    await db.connect();
    console.log("🚀 Bắt đầu seed toàn bộ dữ liệu...\n");

    // ===== LOAD CATEGORIES TỪ DB =====
console.log("📂 Đang load Categories từ DB...");
const categories = await Category.find({});
const categoryMap = {};
categories.forEach(cat => {
  categoryMap[cat.code] = cat._id;
});
console.log(`   ✅ Loaded ${categories.length} categories\n`);

// ===== LOAD AMENITIES TỪ DB =====
console.log("🛠️ Đang load Amenities từ DB...");
const amenities = await Amenity.find({});
const amenityMap = {};
amenities.forEach(am => {
  amenityMap[am.code] = am._id;
});
console.log(`   ✅ Loaded ${amenities.length} amenities\n`);


    // ===== 2. THÊM USERS =====
    console.log("👤 Đang thêm Users...");
    const usersToInsert = await Promise.all(
      usersData.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );
    const insertedUsers = await User.insertMany(usersToInsert);
    console.log(`   ✅ Đã thêm ${insertedUsers.length} users\n`);

    // ===== 5. THÊM PLACES =====
    console.log("📍 Đang thêm Places...");
    const placesToInsert = placesData.map(place => {
      const { categoryCode, amenityCodes, ...placeData } = place;
      return {
        ...placeData,
        category_id: categoryMap[categoryCode],
        amenities: amenityCodes.map(code => amenityMap[code]).filter(Boolean),
        avg_rating: 0,
        total_reviews: 0
      };
    });
    const insertedPlaces = await Place.insertMany(placesToInsert);
    console.log(`   ✅ Đã thêm ${insertedPlaces.length} places\n`);

    // Tạo map place name -> _id
    const placeMap = {};
    insertedPlaces.forEach(place => {
      placeMap[place.name] = place._id;
    });

    // ===== 6. THÊM REVIEWS =====
    console.log("⭐ Đang thêm Reviews...");
    const reviewsData = [
      // ===== REVIEWS CHO PLACE MỚI =====
{ user_id: insertedUsers[0]._id, place_id: placeMap["Kids City Vincom Bà Triệu"], rating: 5, comment: "Khu vui chơi rất sạch sẽ, bé nhà mình chơi cả buổi không chán." },
{ user_id: insertedUsers[1]._id, place_id: placeMap["Kids City Vincom Bà Triệu"], rating: 4, comment: "Trò chơi đa dạng nhưng cuối tuần hơi đông." },

{ user_id: insertedUsers[2]._id, place_id: placeMap["Công viên Yên Sở"], rating: 5, comment: "Không gian rộng rãi, rất phù hợp cho cả gia đình dã ngoại." },
{ user_id: insertedUsers[3]._id, place_id: placeMap["Công viên Yên Sở"], rating: 4, comment: "Thoáng mát, nhiều khu vui chơi cho trẻ em." },

{ user_id: insertedUsers[3]._id, place_id: placeMap["Robotics Lab Junior"], rating: 5, comment: "Con mình rất thích học robot, giáo viên nhiệt tình." },
{ user_id: insertedUsers[2]._id, place_id: placeMap["Robotics Lab Junior"], rating: 5, comment: "Chương trình học dễ hiểu, mang tính giáo dục cao." },

{ user_id: insertedUsers[1]._id, place_id: placeMap["Lala Cafe & Kids Zone"], rating: 4, comment: "Cafe ngon, có khu chơi cho bé khá an toàn." },
{ user_id: insertedUsers[0]._id, place_id: placeMap["Lala Cafe & Kids Zone"], rating: 5, comment: "Rất tiện cho phụ huynh thư giãn trong khi bé chơi." },

{ user_id: insertedUsers[1]._id, place_id: placeMap["Bảo tàng Dân tộc học Việt Nam"], rating: 5, comment: "Khu ngoài trời rất thú vị, bé học được nhiều điều mới." },
{ user_id: insertedUsers[2]._id, place_id: placeMap["Bảo tàng Dân tộc học Việt Nam"], rating: 4, comment: "Không gian rộng, phù hợp cho trẻ khám phá văn hóa." }

    ];
    const insertedReviews = await Review.insertMany(reviewsData);
    console.log(`   ✅ Đã thêm ${insertedReviews.length} reviews\n`);

    // Cập nhật avg_rating và total_reviews cho places
    console.log("📊 Đang cập nhật rating cho Places...");
    for (const placeName of Object.keys(placeMap)) {
      const placeId = placeMap[placeName];
      const stats = await Review.aggregate([
        { $match: { place_id: placeId } },
        { $group: { _id: "$place_id", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
      ]);
      
      if (stats.length > 0) {
        await Place.updateOne(
          { _id: placeId },
          { 
            $set: { 
              avg_rating: parseFloat(stats[0].avgRating.toFixed(1)), 
              total_reviews: stats[0].count 
            } 
          }
        );
      }
    }
    console.log(`   ✅ Đã cập nhật rating\n`);

    // ===== 7. THÊM FAVORITES =====
    console.log("❤️ Đang thêm Favorites...");
    const favoritesData = [
      // ===== FAVORITES CHO USER MỚI =====
{ user_id: insertedUsers[0]._id, place_id: placeMap["Kids City Vincom Bà Triệu"] },
{ user_id: insertedUsers[1]._id, place_id: placeMap["Lala Cafe & Kids Zone"] },

{ user_id: insertedUsers[2]._id, place_id: placeMap["Robotics Lab Junior"] },
{ user_id: insertedUsers[2]._id, place_id: placeMap["Bảo tàng Dân tộc học Việt Nam"] },
{ user_id: insertedUsers[3]._id, place_id: placeMap["Công viên Yên Sở"] },

{ user_id: insertedUsers[2]._id, place_id: placeMap["Kids City Vincom Bà Triệu"] },
{ user_id: insertedUsers[1]._id, place_id: placeMap["Công viên Yên Sở"] }

    ];
    const insertedFavorites = await Favorite.insertMany(favoritesData);
    console.log(`   ✅ Đã thêm ${insertedFavorites.length} favorites\n`);

    // ===== 8. THÊM DAY PLANS =====
    console.log("📅 Đang thêm Day Plans...");
    const dayPlansData = [
      // ===== DAY PLAN 4 =====
{
  user_id: insertedUsers[3]._id,
  title: "Ngày vui chơi cuối tuần cho bé",
  description: "Kết hợp vui chơi trong nhà và thư giãn cafe",
  date: new Date("2025-12-28"),
  cover_image: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=600",
  tags: ["vui chơi", "gia đình", "cuối tuần"],
  items: [
    {
      place_id: placeMap["Kids City Vincom Bà Triệu"],
      custom_place_name: "Vui chơi buổi sáng",
      start_time: "09:30",
      end_time: "12:00",
      image: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=600",
      note: "Nên đến sớm để tránh đông",
      transport: "Ô tô",
      price_range: { min: 120000, max: 220000 },
      sort_order: 1
    },
    {
      place_id: placeMap["Lala Cafe & Kids Zone"],
      custom_place_name: "Nghỉ ngơi và ăn trưa",
      start_time: "12:30",
      end_time: "14:00",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600",
      note: "Có khu vui chơi nhỏ cho bé",
      transport: "Taxi",
      price_range: { min: 60000, max: 180000 },
      sort_order: 2
    }
  ]
},

// ===== DAY PLAN 5 =====
{
  user_id: insertedUsers[0]._id,
  title: "Một ngày học tập và khám phá",
  description: "Học STEM kết hợp tham quan bảo tàng",
  date: new Date("2025-12-30"),
  cover_image: "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=600",
  tags: ["STEM", "giáo dục", "khám phá"],
  items: [
    {
      place_id: placeMap["Robotics Lab Junior"],
      custom_place_name: "Học robot buổi sáng",
      start_time: "09:00",
      end_time: "11:30",
      image: "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=600",
      note: "Đăng ký lớp trước",
      transport: "Grab",
      price_range: { min: 250000, max: 400000 },
      sort_order: 1
    },
    {
      place_id: placeMap["Bảo tàng Dân tộc học Việt Nam"],
      custom_place_name: "Tham quan buổi chiều",
      start_time: "14:00",
      end_time: "16:30",
      image: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=600",
      note: "Ưu tiên khu trải nghiệm ngoài trời",
      transport: "Taxi",
      price_range: { min: 40000, max: 60000 },
      sort_order: 2
    }
  ]
},

// ===== DAY PLAN 6 =====
{
  user_id: insertedUsers[1]._id,
  title: "Dã ngoại xanh cho cả nhà",
  description: "Tận hưởng không khí trong lành và vận động ngoài trời",
  date: new Date("2026-01-02"),
  cover_image: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=600",
  tags: ["thiên nhiên", "ngoài trời", "gia đình"],
  items: [
    {
      place_id: placeMap["Công viên Yên Sở"],
      custom_place_name: "Dã ngoại buổi sáng",
      start_time: "07:00",
      end_time: "11:00",
      image: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=600",
      note: "Mang theo đồ ăn nhẹ",
      transport: "Xe máy",
      price_range: { min: 0, max: 0 },
      sort_order: 1
    }
  ]
}

    ];
    const insertedDayPlans = await DayPlan.insertMany(dayPlansData);
    console.log(`   ✅ Đã thêm ${insertedDayPlans.length} day_plans\n`);

    // ===== 9. THÊM LIKES =====
    console.log("👍 Đang thêm Likes...");
    const likesData = [
      // ===== LIKES CHO DAY PLAN MỚI =====
{ user_id: insertedUsers[0]._id, day_plan_id: insertedDayPlans[0]._id },
{ user_id: insertedUsers[1]._id, day_plan_id: insertedDayPlans[1]._id },

{ user_id: insertedUsers[2]._id, day_plan_id: insertedDayPlans[2]._id },
{ user_id: insertedUsers[3]._id, day_plan_id: insertedDayPlans[2]._id },

{ user_id: insertedUsers[3]._id, day_plan_id: insertedDayPlans[1]._id },
{ user_id: insertedUsers[2]._id, day_plan_id: insertedDayPlans[0]._id }

    ];
    const insertedLikes = await Like.insertMany(likesData);
    console.log(`   ✅ Đã thêm ${insertedLikes.length} likes\n`);

    // ===== 10. IN THỐNG KÊ =====
    console.log("📊 THỐNG KÊ TỔNG:");
    console.log("=".repeat(50));
    console.log(`Users: ${insertedUsers.length}`);
    console.log(`Categories: ${insertedCategories.length}`);
    console.log(`Amenities: ${insertedAmenities.length}`);
    console.log(`Places: ${insertedPlaces.length}`);
    console.log(`Reviews: ${insertedReviews.length}`);
    console.log(`Favorites: ${insertedFavorites.length}`);
    console.log(`Day Plans: ${insertedDayPlans.length}`);
    console.log(`Likes: ${insertedLikes.length}`);
    console.log("=".repeat(50));

    console.log("\n🎉 Seed toàn bộ dữ liệu hoàn tất!");
    
  } catch (error) {
    console.error("❌ Seed thất bại:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();