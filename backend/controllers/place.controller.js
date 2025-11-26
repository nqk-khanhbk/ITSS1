const Place = require("../models/place.model");
const Review = require("../models/review.model");
const Category = require("../models/category.model");
const Amenity = require("../models/amenity.model");

exports.searchPlaces = async (req, res) => {
  try {
    const { 
      keyword, category_ids, amenity_ids, age_ranges, 
      lat, lng, radius, 
      page = 1, limit = 10, view = 'list' 
    } = req.query;

    // Tạo query cơ bản (chưa có location)
    const baseQuery = {};
    
    // 1. Tìm kiếm theo từ khóa
    if (keyword) {
      baseQuery.name = { $regex: keyword, $options: "i" };
    }

    // 2. Bộ lọc Category
    if (category_ids) {
      const categories = category_ids.split(",");
      baseQuery.category_id = { $in: categories };
    }

    // 3. Bộ lọc Amenity
    if (amenity_ids) {
      const amenities = amenity_ids.split(",");
      baseQuery.amenities = { $all: amenities };
    }

    // 4. Bộ lọc Độ tuổi
    if (age_ranges) {
      const ranges = age_ranges.split(",");
      const ageConditions = ranges.map(range => {
        const [minStr, maxStr] = range.split("-");
        const minAge = Number(minStr);
        const maxAge = Number(maxStr);
        return {
          "age_limit.min": { $lte: maxAge },
          "age_limit.max": { $gte: minAge }
        };
      });
      
      if (ageConditions.length > 0) {
        if (baseQuery.$or) {
           baseQuery.$and = [ { $or: baseQuery.$or }, { $or: ageConditions } ];
           delete baseQuery.$or;
        } else {
           baseQuery.$or = ageConditions;
        }
      }
    }

    // Tách ra 2 query object riêng biệt
    const findQuery = { ...baseQuery };  // Dùng để tìm kiếm (có sort)
    const countQuery = { ...baseQuery }; // Dùng để đếm (không sort)

    // 5. Bộ lọc Khoảng cách
    if (lat && lng && radius) {
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const radiusInKm = parseFloat(radius);

        // Query cho FIND: Dùng $near để sắp xếp gần nhất
        findQuery["location.coordinates"] = { 
          $near: { 
            $geometry: { type: "Point", coordinates: [userLng, userLat] }, 
            $maxDistance: radiusInKm * 1000 // Đổi ra mét
          } 
        };

        // Query cho COUNT: Dùng $geoWithin để đếm (tránh lỗi sort)
        // $centerSphere nhận bán kính theo đơn vị radian (km / 6378.1)
        countQuery["location.coordinates"] = {
          $geoWithin: {
            $centerSphere: [ [userLng, userLat], radiusInKm / 6378.1 ]
          }
        };
    }

    // --- BƯỚC 1: LẤY DANH SÁCH PLACE ---
    let places;
    let total = 0;
    const selectFields = "name images price_range category_id amenities location age_limit address description"; 

    if (view === 'map') {
      // Map view dùng findQuery ($near)
      places = await Place.find(findQuery)
        .populate("category_id", "name icon")
        .populate("amenities", "name icon code")
        .select(selectFields)
        .limit(100)
        .exec();
      total = places.length;
    } else {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // List view dùng findQuery ($near)
      places = await Place.find(findQuery)
        .populate("category_id", "name icon")
        .populate("amenities", "name icon code")
        .select(selectFields)
        .skip(skip)
        .limit(parseInt(limit))
        .exec();

      // Đếm tổng dùng countQuery ($geoWithin) -> KHẮC PHỤC LỖI TẠI ĐÂY
      total = await Place.countDocuments(countQuery);
    }

    // --- BƯỚC 2: TÍNH TOÁN RATING ---
    const placeIds = places.map(p => p._id);
    const reviewsStats = await Review.aggregate([
      { $match: { place_id: { $in: placeIds } } },
      { 
        $group: { 
          _id: "$place_id", 
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 }
        } 
      }
    ]);

    // --- BƯỚC 3: MERGE DỮ LIỆU ---
    const formattedPlaces = places.map(place => {
      const stats = reviewsStats.find(r => r._id.equals(place._id));
      return {
        _id: place._id,
        name: place.name,
        thumbnail: place.images && place.images.length > 0 ? place.images[0].url : null, 
        images: place.images,
        description: place.description,
        price_range: place.price_range,
        category: place.category_id,
        amenities: place.amenities,
        location: place.location,
        age_limit: place.age_limit,
        address: place.address,
        rating: stats ? parseFloat(stats.avgRating.toFixed(1)) : 0,
        total_reviews: stats ? stats.count : 0
      };
    });

    res.status(200).json({
      success: true,
      data: formattedPlaces,
      pagination: {
        total,
        page: view === 'map' ? 1 : parseInt(page),
        limit: view === 'map' ? total : parseInt(limit),
        totalPages: view === 'map' ? 1 : Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error("Search Error:", error);
  }
};

// --- THÊM MỚI: HÀM LẤY CHI TIẾT ĐỊA ĐIỂM ---
exports.getPlaceDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Tìm địa điểm theo ID
    const place = await Place.findById(id)
      .populate("category_id", "name icon")
      .populate("amenities", "name icon code")
      .exec();

    if (!place) {
      return res.status(404).json({ success: false, message: "Không tìm thấy địa điểm" });
    }

    // 2. Tính toán Rating trung bình & Tổng review
    const mongoose = require("mongoose"); 
    const currentPlaceId = new mongoose.Types.ObjectId(id); // Tạo ObjectId chuẩn

    const reviewStats = await Review.aggregate([
      { $match: { place_id: currentPlaceId } },
      { 
        $group: { 
          _id: "$place_id", 
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 }
        } 
      }
    ]);

    const rating = reviewStats.length > 0 ? parseFloat(reviewStats[0].avgRating.toFixed(1)) : 0;
    const totalReviews = reviewStats.length > 0 ? reviewStats[0].count : 0;

    // 3. Lấy danh sách địa điểm liên quan (Cùng Category, trừ chính nó)
    // Lưu ý: place.category_id lúc này là Object (do populate), ta lấy ._id của nó
    const categoryId = place.category_id._id;

    const relatedPlaces = await Place.find({
      category_id: categoryId, 
      _id: { $ne: currentPlaceId } // So sánh ObjectId chuẩn để loại trừ chính xác
    })
    .select("name images price_range address rating") 
    .limit(5) 
    .exec();

    // Format lại related places để có thumbnail
    const formattedRelated = relatedPlaces.map(p => ({
      _id: p._id,
      name: p.name,
      thumbnail: p.images && p.images.length > 0 ? p.images[0].url : null,
      price_range: p.price_range,
      address: p.address
    }));

    // 4. Trả về kết quả
    const placeData = place.toObject(); 
    
    res.status(200).json({
      success: true,
      data: {
        ...placeData,
        rating: rating,
        total_reviews: totalReviews,
        related_places: formattedRelated
      }
    });

  } catch (error) {
    console.error("Get Detail Error:", error);
    if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: "ID địa điểm không hợp lệ" });
    }
    res.status(500).json({ success: false, message: "Lỗi server khi lấy chi tiết địa điểm" });
  }
};
