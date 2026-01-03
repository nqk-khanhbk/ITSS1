const Place = require("../models/place.model");
const Review = require("../models/review.model");
const Category = require("../models/category.model");
const Amenity = require("../models/amenity.model");

// ============ HELPER FUNCTIONS ============

/**
 * Format rating luôn có 1 chữ số thập phân (4 -> "4.0")
 */
const formatRating = (rating) => {
  if (!rating && rating !== 0) return "0.0";
  return Number(rating).toFixed(1);
};

/**
 * Parse thời gian mở cửa từ string "08:00-21:00" thành object { open: 8, close: 21 }
 */
const parseOpeningTime = (timeStr) => {
  if (!timeStr || timeStr.toLowerCase() === "closed") return null;

  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
  if (!match) return null;

  return {
    open: parseInt(match[1]),
    close: parseInt(match[3])
  };
};

/**
 * Kiểm tra place có mở cửa theo buổi không
 * morning: mở trước 12:00
 * afternoon: mở trong khoảng 12:00-18:00
 * evening: mở sau 18:00
 * all_day: mở từ sáng đến tối (trước 9:00 và sau 20:00)
 */
const checkOpenTime = (openingHours, timeFilter) => {
  if (!openingHours) return false;

  // Lấy tất cả các ngày có giờ mở cửa
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  for (const day of days) {
    const time = parseOpeningTime(openingHours[day]);
    if (!time) continue;

    switch (timeFilter) {
      case 'morning':
        if (time.open < 12) return true;
        break;
      case 'afternoon':
        if (time.open <= 14 && time.close >= 14) return true;
        break;
      case 'evening':
        if (time.close >= 19) return true;
        break;
      case 'all_day':
        if (time.open <= 9 && time.close >= 20) return true;
        break;
    }
  }
  return false;
};

/**
 * Kiểm tra place có mở cửa cuối tuần không
 */
const checkOpenWeekend = (openingHours) => {
  if (!openingHours) return false;

  const satTime = parseOpeningTime(openingHours.sat);
  const sunTime = parseOpeningTime(openingHours.sun);

  return satTime !== null || sunTime !== null;
};

// ============ MAIN SEARCH FUNCTION ============

exports.searchPlaces = async (req, res) => {
  try {
    const {
      // Các filter cũ
      keyword,
      category_ids,
      amenity_ids,
      age_ranges,
      lat, lng, radius,

      // Các filter mới
      districts,           // Quận/Huyện: "Hoàn Kiếm,Ba Đình,Cầu Giấy"
      price_filter,        // "free", "under_100k", "100k_300k", "over_300k"
      price_min,           // Giá tối thiểu (range slider)
      price_max,           // Giá tối đa (range slider)
      open_time,           // "morning", "afternoon", "evening", "all_day"
      open_weekend,        // "true" - Mở cuối tuần
      open_holidays,       // "true" - Mở ngày lễ
      crowd_level,         // "low", "medium", "high"
      min_rating,          // "4", "4.5", "5"
      sort_by,             // "rating", "reviews", "price_asc", "price_desc"

      // Pagination
      page = 1,
      limit = 6,
      view = 'list'
    } = req.query;

    // Tạo query cơ bản
    const baseQuery = {};

    // ===== 1. TÌM KIẾM THEO TỪ KHÓA =====
    if (keyword) {
      baseQuery.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { address: { $regex: keyword, $options: "i" } }
      ];
    }

    // ===== 2. BỘ LỌC CATEGORY (Loại hình hoạt động) =====
    if (category_ids) {
      const categories = category_ids.split(",");
      baseQuery.category_id = { $in: categories };
    }

    // ===== 3. BỘ LỌC AMENITY (Tiện ích) =====
    if (amenity_ids) {
      const amenities = amenity_ids.split(",");
      baseQuery.amenities = { $all: amenities };
    }

    // ===== 4. BỘ LỌC ĐỘ TUỔI =====
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
          baseQuery.$and = baseQuery.$and || [];
          baseQuery.$and.push({ $or: ageConditions });
        } else {
          baseQuery.$or = ageConditions;
        }
      }
    }

    // ===== 5. BỘ LỌC QUẬN/HUYỆN =====
    if (districts) {
      const districtList = districts.split(",").map(d => d.trim());
      baseQuery.district = { $in: districtList };
    }

    // ===== 6. BỘ LỌC GIÁ =====
    if (price_filter) {
      switch (price_filter) {
        case 'free':
          baseQuery.max_price = { $eq: 0 };
          break;
        case 'under_100k':
          baseQuery.min_price = { $lt: 100000 };
          break;
        case '100k_300k':
          baseQuery.$and = baseQuery.$and || [];
          baseQuery.$and.push(
            { min_price: { $lte: 300000 } },
            { max_price: { $gte: 100000 } }
          );
          break;
        case 'over_300k':
          baseQuery.max_price = { $gt: 300000 };
          break;
      }
    } else if (price_min || price_max) {
      // Range slider
      if (price_min) {
        baseQuery.max_price = { $gte: parseInt(price_min) };
      }
      if (price_max) {
        baseQuery.min_price = { $lte: parseInt(price_max) };
      }
    }

    // ===== 7. BỘ LỌC MỞ CỬA NGÀY LỄ =====
    if (open_holidays === 'true') {
      baseQuery.open_on_holidays = true;
    }

    // ===== 8. BỘ LỌC MỨC ĐỘ ĐÔNG ĐÚC =====
    if (crowd_level) {
      const levels = crowd_level.split(",");
      baseQuery.crowd_level = { $in: levels };
    }

    // ===== 9. BỘ LỌC ĐÁNH GIÁ (dùng avg_rating đã lưu sẵn) =====
    if (min_rating) {
      baseQuery.avg_rating = { $gte: parseFloat(min_rating) };
    }

    // Tách ra 2 query object riêng biệt
    const findQuery = { ...baseQuery };
    const countQuery = { ...baseQuery };

    // ===== 10. BỘ LỌC KHOẢNG CÁCH =====
    if (lat && lng && radius) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      let radiusInKm = parseFloat(radius);

      // Map giá trị từ frontend
      if (radius === 'over_10km') {
        radiusInKm = 50; // Tìm trong 50km
      }

      findQuery["location.coordinates"] = {
        $near: {
          $geometry: { type: "Point", coordinates: [userLng, userLat] },
          $maxDistance: radiusInKm * 1000
        }
      };

      countQuery["location.coordinates"] = {
        $geoWithin: {
          $centerSphere: [[userLng, userLat], radiusInKm / 6378.1]
        }
      };
    }

    // ===== XÁC ĐỊNH SORT =====
    let sortOption = {};
    switch (sort_by) {
      case 'rating':
        sortOption = { avg_rating: -1 };
        break;
      case 'reviews':
        sortOption = { total_reviews: -1 };
        break;
      case 'price_asc':
        sortOption = { min_price: 1 };
        break;
      case 'price_desc':
        sortOption = { max_price: -1 };
        break;
      default:
        sortOption = { created_at: -1 };
    }

    // ===== LẤY DANH SÁCH PLACE =====
    let places;
    let total = 0;
    const selectFields = "name images price_range min_price max_price category_id amenities location age_limit address description district crowd_level avg_rating total_reviews opening_hours open_on_holidays";

    if (view === 'map') {
      places = await Place.find(findQuery)
        .populate("category_id", "name icon code")
        .populate("amenities", "name icon code")
        .select(selectFields)
        .limit(100)
        .exec();
      total = places.length;
    } else {
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Nếu không có geo query, có thể sort
      let query = Place.find(findQuery)
        .populate("category_id", "name icon code")
        .populate("amenities", "name icon code")
        .select(selectFields);

      // Chỉ sort khi không có $near (geo query đã sort theo khoảng cách)
      if (!findQuery["location.coordinates"]) {
        query = query.sort(sortOption);
      }

      places = await query.skip(skip).limit(parseInt(limit)).exec();
      total = await Place.countDocuments(countQuery);
    }

    // ===== LỌC THÊM (những filter không thể query trực tiếp) =====
    let filteredPlaces = places;

    // Lọc theo thời gian mở cửa
    if (open_time) {
      filteredPlaces = filteredPlaces.filter(place =>
        checkOpenTime(place.opening_hours, open_time)
      );
    }

    // Lọc theo mở cửa cuối tuần
    if (open_weekend === 'true') {
      filteredPlaces = filteredPlaces.filter(place =>
        checkOpenWeekend(place.opening_hours)
      );
    }

    // ===== FORMAT KẾT QUẢ =====
    const formattedPlaces = filteredPlaces.map(place => {
      return {
        _id: place._id,
        name: place.name,
        thumbnail: place.images && place.images.length > 0 ? place.images[0].url : null,
        images: place.images,
        description: place.description,
        price_range: place.price_range,
        min_price: place.min_price,
        max_price: place.max_price,
        category: place.category_id,
        amenities: place.amenities,
        location: place.location,
        age_limit: place.age_limit,
        address: place.address,
        district: place.district,
        crowd_level: place.crowd_level,
        opening_hours: place.opening_hours,
        open_on_holidays: place.open_on_holidays,
        rating: formatRating(place.avg_rating),
        total_reviews: place.total_reviews || 0
      };
    });

    res.status(200).json({
      success: true,
      data: formattedPlaces,
      pagination: {
        total: open_time || open_weekend ? formattedPlaces.length : total,
        page: view === 'map' ? 1 : parseInt(page),
        limit: view === 'map' ? total : parseInt(limit),
        totalPages: view === 'map' ? 1 : Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi tìm kiếm" });
  }
};

// ============ GET PLACE DETAIL ============

exports.getPlaceDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const place = await Place.findById(id)
      .populate("category_id", "name icon code")
      .populate("amenities", "name icon code")
      .exec();

    if (!place) {
      return res.status(404).json({ success: false, message: "Không tìm thấy địa điểm" });
    }

    // Lấy related places (cùng category hoặc cùng district)
    const relatedPlaces = await Place.find({
      $or: [
        { category_id: place.category_id._id },
        { district: place.district }
      ],
      _id: { $ne: place._id }
    })
      .select("name images price_range address avg_rating total_reviews district")
      .sort({ avg_rating: -1 })
      .limit(5)
      .exec();

    const formattedRelated = relatedPlaces.map(p => ({
      _id: p._id,
      name: p.name,
      thumbnail: p.images && p.images.length > 0 ? p.images[0].url : null,
      price_range: p.price_range,
      address: p.address,
      district: p.district,
      rating: formatRating(p.avg_rating),
      total_reviews: p.total_reviews || 0
    }));

    const placeData = place.toObject();

    res.status(200).json({
      success: true,
      data: {
        ...placeData,
        rating: formatRating(place.avg_rating),
        total_reviews: place.total_reviews || 0,
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

// ============ GET FILTER OPTIONS (API lấy danh sách filter) ============

exports.getFilterOptions = async (req, res) => {
  try {
    // Lấy tất cả categories
    const categories = await Category.find({}).select("name code icon").exec();

    // Lấy tất cả amenities
    const amenities = await Amenity.find({}).select("name code icon").exec();

    // Danh sách quận/huyện
    const districts = [
      "Hoàn Kiếm", "Hai Bà Trưng", "Ba Đình", "Cầu Giấy", "Tây Hồ",
      "Hoàng Mai", "Hà Đông", "Nam Từ Liêm", "Bắc Từ Liêm", "Long Biên",
      "Gia Lâm", "Đông Anh", "Thanh Xuân", "Đống Đa", "Khu vực khác"
    ];

    // Danh sách độ tuổi
    const ageRanges = [
      { value: "1-5", label: "1 - 5 tuổi" },
      { value: "6-12", label: "6 - 12 tuổi" }
    ];

    // Danh sách khoảng giá
    const priceFilters = [
      { value: "free", label: "Miễn phí" },
      { value: "under_100k", label: "Dưới 100.000đ" },
      { value: "100k_300k", label: "100.000đ - 300.000đ" },
      { value: "over_300k", label: "Trên 300.000đ" }
    ];

    // Danh sách thời gian mở cửa
    const openTimeFilters = [
      { value: "morning", label: "Mở buổi sáng" },
      { value: "afternoon", label: "Mở buổi chiều" },
      { value: "evening", label: "Mở buổi tối" },
      { value: "all_day", label: "Mở cả ngày" }
    ];

    // Danh sách mức độ đông đúc
    const crowdLevels = [
      { value: "low", label: "Ít người" },
      { value: "medium", label: "Trung bình" },
      { value: "high", label: "Thường đông" }
    ];

    // Danh sách đánh giá
    const ratingFilters = [
      { value: "5", label: "5★" },
      { value: "4.5", label: "4.5★ trở lên" },
      { value: "4", label: "4★ trở lên" }
    ];

    // Danh sách khoảng cách
    const distanceFilters = [
      { value: "2", label: "Dưới 2km" },
      { value: "5", label: "Dưới 5km" },
      { value: "10", label: "Dưới 10km" },
      { value: "over_10km", label: "Trên 10km" }
    ];

    res.status(200).json({
      success: true,
      data: {
        categories,
        amenities,
        districts,
        ageRanges,
        priceFilters,
        openTimeFilters,
        crowdLevels,
        ratingFilters,
        distanceFilters
      }
    });

  } catch (error) {
    console.error("Get Filter Options Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy filter options" });
  }
};

// ============ GET PLACES RANKING (Bảng xếp hạng) ============

exports.getPlacesRanking = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Lấy tất cả places, sắp xếp theo avg_rating giảm dần
    const places = await Place.find({})
      .select("name images description price_range avg_rating total_reviews")
      .sort({ avg_rating: -1, total_reviews: -1 }) // Ưu tiên rating cao, sau đó là nhiều reviews
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    // Đếm tổng số places
    const total = await Place.countDocuments({});

    // Format kết quả với thứ hạng
    const formattedPlaces = places.map((place, index) => ({
      rank: skip + index + 1, // Thứ hạng
      _id: place._id,
      name: place.name,
      images: place.images || [],
      description: place.description || "",
      price_range: place.price_range || "Miễn phí",
      rating: formatRating(place.avg_rating),
      total_reviews: place.total_reviews || 0
    }));

    res.status(200).json({
      success: true,
      data: formattedPlaces,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error("Get Places Ranking Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy bảng xếp hạng"
    });
  }
};
