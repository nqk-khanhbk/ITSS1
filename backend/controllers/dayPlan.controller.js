const DayPlan = require("../models/dayPlan.model");
const Place = require("../models/place.model");
const Like = require("../models/like.model");
const User = require("../models/user.model");

// POST /api/day-plans - Tạo kế hoạch mới
module.exports.create = async (req, res) => {
  try {
    const { user_id, title, date, cover_image, tags, items, note } = req.body;

    // Validate required fields
    if (!user_id || !title) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp user_id và title",
      });
    }

    // Kiểm tra user tồn tại
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Validate items nếu có
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Nếu có place_id, kiểm tra place tồn tại
        if (item.place_id) {
          const place = await Place.findById(item.place_id);
          if (!place) {
            return res.status(404).json({
              success: false,
              message: `Không tìm thấy địa điểm với ID: ${item.place_id}`,
            });
          }
        }

        // Set sort_order nếu chưa có
        if (!item.sort_order) {
          item.sort_order = i + 1;
        }
      }
    }

    // Tạo day plan mới
    const newDayPlan = await DayPlan.create({
      user_id,
      title,
      date: date ? new Date(date) : null,
      cover_image: cover_image || "",
      tags: tags || [],
      items: items || [],
      note: note || "",
    });

    // Populate thông tin chi tiết
    const populatedDayPlan = await DayPlan.findById(newDayPlan._id)
      .populate("user_id", "fullName avatar")
      .populate("items.place_id", "name images address city area")
      .lean();

    res.status(201).json({
      success: true,
      message: "Tạo kế hoạch thành công",
      data: populatedDayPlan,
    });
  } catch (error) {
    console.error("Create Day Plan Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo kế hoạch",
      error: error.message,
    });
  }
};

// GET /api/day-plans - Lấy danh sách day plans với thông tin chi tiết, tìm kiếm và lọc
module.exports.list = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 6,
      search,
      tags,
      province,
      area,
      price_min,
      price_max,
      age_min,
      age_max,
    } = req.query;

    // Build base filter
    const filter = {};

    // Search by title or description
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    // Filter by tags
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(",");
      filter.tags = { $in: tagArray };
    }

    // Get ALL day plans that match basic filters (we'll filter by price/age/location later)
    const allDayPlans = await DayPlan.find(filter)
      .populate("user_id", "fullName avatar")
      .populate("items.place_id")
      .sort({ created_at: -1 })
      .lean();

    // Process and filter each day plan
    const processedPlans = await Promise.all(
      allDayPlans.map(async (dayPlan) => {
        // Count likes for this day plan
        const likesCount = await Like.countDocuments({
          day_plan_id: dayPlan._id,
        });

        // Calculate total price range from items
        let totalMinPrice = 0;
        let totalMaxPrice = 0;
        let hasPrice = false;

        // Get unique provinces and areas from places
        const provinces = new Set();
        const areas = new Set();

        // Calculate age range intersection
        let ageMin = null;
        let ageMax = null;

        dayPlan.items.forEach((item) => {
          // Price calculation
          if (item.price_range) {
            if (
              item.price_range.min !== undefined &&
              item.price_range.min !== null
            ) {
              totalMinPrice += item.price_range.min;
              hasPrice = true;
            }
            if (
              item.price_range.max !== undefined &&
              item.price_range.max !== null
            ) {
              totalMaxPrice += item.price_range.max;
            } else if (item.price_range.min !== undefined) {
              totalMaxPrice += item.price_range.min;
            }
          }

          // Get province and area from place
          if (item.place_id) {
            if (item.place_id.city) {
              provinces.add(item.place_id.city);
            }
            if (item.place_id.area) {
              areas.add(item.place_id.area);
            }

            // Age range intersection
            if (item.place_id.age_limit) {
              const placeAgeMin = item.place_id.age_limit.min;
              const placeAgeMax = item.place_id.age_limit.max;

              if (placeAgeMin !== undefined && placeAgeMin !== null) {
                ageMin =
                  ageMin === null ? placeAgeMin : Math.max(ageMin, placeAgeMin);
              }

              if (placeAgeMax !== undefined && placeAgeMax !== null) {
                ageMax =
                  ageMax === null ? placeAgeMax : Math.min(ageMax, placeAgeMax);
              }
            }
          }
        });

        // Format price range
        let priceRangeStr = "Miễn phí";
        if (hasPrice) {
          if (totalMinPrice === totalMaxPrice) {
            priceRangeStr = `${totalMinPrice.toLocaleString("vi-VN")}đ`;
          } else {
            priceRangeStr = `${totalMinPrice.toLocaleString(
              "vi-VN"
            )}đ - ${totalMaxPrice.toLocaleString("vi-VN")}đ`;
          }
        }

        // Format age range
        let ageRangeStr = "Mọi lứa tuổi";
        if (ageMin !== null || ageMax !== null) {
          if (ageMin !== null && ageMax !== null) {
            if (ageMin === ageMax) {
              ageRangeStr = `${ageMin} tuổi`;
            } else if (ageMax < ageMin) {
              ageRangeStr = "Không phù hợp"; // Age ranges don't intersect
            } else {
              ageRangeStr = `${ageMin} - ${ageMax} tuổi`;
            }
          } else if (ageMin !== null) {
            ageRangeStr = `Từ ${ageMin} tuổi`;
          } else if (ageMax !== null) {
            ageRangeStr = `Đến ${ageMax} tuổi`;
          }
        }

        // Apply filters - Filter by province (city)
        let shouldInclude = true;

        if (province) {
          const provinceSearch = new RegExp(province, "i");
          const hasMatchingProvince = Array.from(provinces).some((p) =>
            provinceSearch.test(p)
          );
          if (!hasMatchingProvince) {
            shouldInclude = false;
          }
        }

        // Filter by area
        if (area && shouldInclude) {
          const areaSearch = new RegExp(area, "i");
          const hasMatchingArea = Array.from(areas).some((a) =>
            areaSearch.test(a)
          );
          if (!hasMatchingArea) {
            shouldInclude = false;
          }
        }

        // Filter by price range
        if ((price_min || price_max) && shouldInclude) {
          const minPrice = price_min ? parseInt(price_min) : 0;
          const maxPrice = price_max ? parseInt(price_max) : Infinity;

          if (hasPrice) {
            // DayPlan's range must be within requested range
            if (totalMinPrice < minPrice || totalMaxPrice > maxPrice) {
              shouldInclude = false;
            }
          }
        }

        // Filter by age limit
        if ((age_min !== undefined || age_max !== undefined) && shouldInclude) {
          const minAge = age_min !== undefined ? parseInt(age_min) : 0;
          const maxAge = age_max !== undefined ? parseInt(age_max) : Infinity;

          if (ageMin !== null && ageMax !== null) {
            if (ageMax < ageMin) {
              shouldInclude = false;
            } else {
              if (ageMin < minAge || ageMax > maxAge) {
                shouldInclude = false;
              }
            }
          } else if (ageMin !== null) {
            if (ageMin < minAge) {
              shouldInclude = false;
            }
          } else if (ageMax !== null) {
            if (ageMax > maxAge) {
              shouldInclude = false;
            }
          }
        }

        if (!shouldInclude) {
          return null;
        }

        return {
          id: dayPlan._id,
          user: {
            fullName: dayPlan.user_id?.fullName || "Unknown",
            avatar: dayPlan.user_id?.avatar || "",
          },
          likes: likesCount,
          cover: dayPlan.cover_image || "",
          title: dayPlan.title,
          price_range: priceRangeStr,
          age: ageRangeStr,
          description: dayPlan.description || "",
          province: Array.from(provinces),
          area: Array.from(areas),
          tags: dayPlan.tags || [],
        };
      })
    );

    // Filter out null results (filtered items)
    const allFilteredResults = processedPlans.filter((r) => r !== null);

    // NOW apply pagination to filtered results
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const paginatedResults = allFilteredResults.slice(skip, skip + limitNum);
    const totalFiltered = allFilteredResults.length;
    const totalPages = Math.ceil(totalFiltered / limitNum);

    return res.status(200).json({
      message: "Lấy danh sách thành công",
      data: paginatedResults,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: allDayPlans.length,
        totalFiltered: totalFiltered,
        totalPages: totalPages,
      },
    });
  } catch (err) {
    console.error("Get day plans error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Helper function: Calculate duration between start and end time
const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return null;

  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const diffMinutes = endMinutes - startMinutes;

  if (diffMinutes <= 0) return null;

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours === 0) return `${minutes} phút`;
  if (minutes === 0) return `${hours} giờ`;
  return `${hours} giờ ${minutes} phút`;
};

// Helper function: Format opening hours
const formatOpeningHours = (openingHours) => {
  if (!openingHours) return null;

  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "short" })
    .toLowerCase();
  const dayMap = {
    sun: "sun",
    mon: "mon",
    tue: "tue",
    wed: "wed",
    thu: "thu",
    fri: "fri",
    sat: "sat",
  };

  return openingHours[dayMap[today]] || openingHours.mon || null;
};

// Helper function: Format price range
const formatPrice = (priceRange) => {
  if (!priceRange) return "Miễn phí";

  const { min, max } = priceRange;

  if (!min && !max) return "Miễn phí";

  if (min === max || !max) {
    return `${min.toLocaleString("vi-VN")}đ`;
  }

  return `${min.toLocaleString("vi-VN")}đ - ${max.toLocaleString("vi-VN")}đ`;
};

// GET /api/day-plans/:id - Lấy chi tiết day plan
module.exports.detail = async (req, res) => {
  try {
    const { id } = req.params;

    // Get day plan with populated data
    const dayPlan = await DayPlan.findById(id)
      .populate("user_id", "fullName avatar")
      .populate("items.place_id")
      .lean();

    if (!dayPlan) {
      return res.status(404).json({ message: "Không tìm thấy kế hoạch" });
    }

    // Count likes
    const likesCount = await Like.countDocuments({
      day_plan_id: dayPlan._id,
    });

    // Check if current user has liked (if authenticated)
    const isLiked = req.user?._id
      ? !!(await Like.exists({
          day_plan_id: dayPlan._id,
          user_id: req.user._id,
        }))
      : false;

    // Calculate total price range from items
    let totalMinPrice = 0;
    let totalMaxPrice = 0;
    let hasPrice = false;

    // Calculate age range intersection
    let ageMin = null;
    let ageMax = null;

    dayPlan.items.forEach((item) => {
      // Price calculation
      if (item.price_range) {
        if (
          item.price_range.min !== undefined &&
          item.price_range.min !== null
        ) {
          totalMinPrice += item.price_range.min;
          hasPrice = true;
        }
        if (
          item.price_range.max !== undefined &&
          item.price_range.max !== null
        ) {
          totalMaxPrice += item.price_range.max;
        } else if (item.price_range.min !== undefined) {
          totalMaxPrice += item.price_range.min;
        }
      }

      // Age range intersection
      if (item.place_id?.age_limit) {
        const placeAgeMin = item.place_id.age_limit.min;
        const placeAgeMax = item.place_id.age_limit.max;

        if (placeAgeMin !== undefined && placeAgeMin !== null) {
          ageMin =
            ageMin === null ? placeAgeMin : Math.max(ageMin, placeAgeMin);
        }

        if (placeAgeMax !== undefined && placeAgeMax !== null) {
          ageMax =
            ageMax === null ? placeAgeMax : Math.min(ageMax, placeAgeMax);
        }
      }
    });

    // Format price range
    let priceRangeStr = "Miễn phí";
    if (hasPrice) {
      if (totalMinPrice === totalMaxPrice) {
        priceRangeStr = `${totalMinPrice.toLocaleString("vi-VN")}đ`;
      } else {
        priceRangeStr = `${totalMinPrice.toLocaleString(
          "vi-VN"
        )}đ - ${totalMaxPrice.toLocaleString("vi-VN")}đ`;
      }
    }

    // Format age range
    let ageRangeStr = "Mọi lứa tuổi";
    if (ageMin !== null || ageMax !== null) {
      if (ageMin !== null && ageMax !== null) {
        if (ageMin === ageMax) {
          ageRangeStr = `${ageMin} tuổi`;
        } else if (ageMax < ageMin) {
          ageRangeStr = "Không phù hợp";
        } else {
          ageRangeStr = `${ageMin} - ${ageMax} tuổi`;
        }
      } else if (ageMin !== null) {
        ageRangeStr = `Từ ${ageMin} tuổi`;
      } else if (ageMax !== null) {
        ageRangeStr = `Đến ${ageMax} tuổi`;
      }
    }

    // Get time range from first and last items
    const firstItem = dayPlan.items[0];
    const lastItem = dayPlan.items[dayPlan.items.length - 1];
    const timeRange =
      firstItem?.start_time && lastItem?.end_time
        ? `${firstItem.start_time}-${lastItem.end_time}`
        : null;

    // Build timeline
    const timeline = dayPlan.items.map((item, index) => ({
      id: item._id,
      name: item.custom_place_name || item.place_id?.name || "",
      time: item.start_time || "",
      duration: calculateDuration(item.start_time, item.end_time),
      transport: item.transport || "",
      image: item.image || item.place_id?.images?.[0]?.url || "",
      openingHours: formatOpeningHours(item.place_id?.opening_hours),
      estimatedCost: formatPrice(item.price_range),
      description: item.place_id?.description || "",
      note: item.note || "",
      hasWarning: !!item.caution,
    }));

    // Build warnings list
    const warnings = dayPlan.items
      .filter((item) => item.caution)
      .map((item) => ({
        location: item.custom_place_name || item.place_id?.name || "",
        note: item.caution,
      }));

    return res.status(200).json({
      message: "Lấy chi tiết thành công",
      data: {
        id: dayPlan._id,
        title: dayPlan.title,
        user: {
          name: dayPlan.user_id?.fullName || "Unknown",
          avatar: dayPlan.user_id?.avatar || "",
        },
        likes: likesCount,
        isLiked: isLiked,
        overview: {
          price: priceRangeStr,
          time: timeRange,
          age: ageRangeStr,
        },
        timeline: timeline,
        warnings: warnings,
      },
    });
  } catch (err) {
    console.error("Get day plan detail error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// ============ LẤY DANH SÁCH KẾ HOẠCH YÊU THÍCH ============
module.exports.getFavoriteDayPlans = async (req, res) => {
  try {
    const { user_id, page = 1, limit = 10 } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp user_id",
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Lấy danh sách likes của user
    const likes = await Like.find({ user_id })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Đếm tổng số likes
    const total = await Like.countDocuments({ user_id });

    // Lấy danh sách day_plan_ids
    const dayPlanIds = likes.map((like) => like.day_plan_id);

    // Lấy thông tin chi tiết các day plans
    const dayPlans = await DayPlan.find({ _id: { $in: dayPlanIds } })
      .populate("user_id", "fullName avatar")
      .populate({
        path: "items.place_id",
        select: "name images address",
      })
      .lean();

    // Tạo map để giữ thứ tự theo likes
    const dayPlanMap = {};
    dayPlans.forEach((dp) => {
      dayPlanMap[dp._id.toString()] = dp;
    });

    // Format kết quả theo thứ tự likes
    const formattedResults = await Promise.all(
      likes.map(async (like) => {
        const dayPlan = dayPlanMap[like.day_plan_id.toString()];

        if (!dayPlan) return null; // Day plan đã bị xóa

        // Đếm tổng số likes của day plan này
        const totalLikes = await Like.countDocuments({
          day_plan_id: dayPlan._id,
        });

        // Lấy tất cả ảnh từ day plan
        const images = [];

        // Thêm cover image
        if (dayPlan.cover_image) {
          images.push({
            url: dayPlan.cover_image,
            alt_text: "Cover image",
          });
        }

        // Thêm ảnh từ các items
        dayPlan.items.forEach((item) => {
          if (item.image) {
            images.push({
              url: item.image,
              alt_text: item.custom_place_name || "Item image",
            });
          }
        });

        // Lấy danh sách các địa điểm trong kế hoạch
        const places = dayPlan.items
          .filter((item) => item.place_id)
          .map((item) => ({
            place_id: item.place_id._id,
            name: item.place_id.name,
            custom_name: item.custom_place_name || null,
            address: item.place_id.address,
            thumbnail:
              item.place_id.images && item.place_id.images.length > 0
                ? item.place_id.images[0].url
                : null,
          }));

        return {
          like_id: like._id,
          day_plan_id: dayPlan._id,
          title: dayPlan.title,
          description: dayPlan.description || "",
          images: images,
          places: places,
          places_count: places.length,
          total_likes: totalLikes,
          tags: dayPlan.tags || [],
          author: {
            user_id: dayPlan.user_id?._id,
            fullName: dayPlan.user_id?.fullName || "Unknown",
            avatar: dayPlan.user_id?.avatar || "",
          },
          liked_at: like.created_at,
        };
      })
    );

    // Loại bỏ null (day plans đã bị xóa)
    const filteredResults = formattedResults.filter((r) => r !== null);

    res.status(200).json({
      success: true,
      data: filteredResults,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get Favorite Day Plans Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách kế hoạch yêu thích",
    });
  }
};

// ============ THÊM KẾ HOẠCH VÀO YÊU THÍCH (LIKE) ============
module.exports.likeDayPlan = async (req, res) => {
  try {
    const { user_id, day_plan_id } = req.body;

    if (!user_id || !day_plan_id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp user_id và day_plan_id",
      });
    }

    // Kiểm tra day plan tồn tại
    const dayPlan = await DayPlan.findById(day_plan_id);
    if (!dayPlan) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kế hoạch",
      });
    }

    // Kiểm tra đã like chưa
    const existingLike = await Like.findOne({ user_id, day_plan_id });
    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã yêu thích kế hoạch này rồi",
      });
    }

    // Tạo like mới
    const newLike = await Like.create({ user_id, day_plan_id });

    // Đếm tổng likes
    const totalLikes = await Like.countDocuments({ day_plan_id });

    res.status(201).json({
      success: true,
      message: "Đã thêm vào danh sách yêu thích",
      data: {
        like_id: newLike._id,
        day_plan_id: day_plan_id,
        total_likes: totalLikes,
      },
    });
  } catch (error) {
    console.error("Like Day Plan Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm yêu thích",
    });
  }
};

// ============ XÓA KẾ HOẠCH KHỎI YÊU THÍCH (UNLIKE) ============
module.exports.unlikeDayPlan = async (req, res) => {
  try {
    const { day_plan_id } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp user_id",
      });
    }

    const result = await Like.deleteOne({ user_id, day_plan_id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy trong danh sách yêu thích",
      });
    }

    // Đếm tổng likes còn lại
    const totalLikes = await Like.countDocuments({ day_plan_id });

    res.status(200).json({
      success: true,
      message: "Đã xóa khỏi danh sách yêu thích",
      data: {
        total_likes: totalLikes,
      },
    });
  } catch (error) {
    console.error("Unlike Day Plan Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa yêu thích",
    });
  }
};

// ============ KIỂM TRA ĐÃ YÊU THÍCH KẾ HOẠCH CHƯA ============
module.exports.checkLikeDayPlan = async (req, res) => {
  try {
    const { day_plan_id } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp user_id",
      });
    }

    const like = await Like.findOne({ user_id, day_plan_id });
    const totalLikes = await Like.countDocuments({ day_plan_id });

    res.status(200).json({
      success: true,
      data: {
        is_liked: !!like,
        like_id: like ? like._id : null,
        total_likes: totalLikes,
      },
    });
  } catch (error) {
    console.error("Check Like Day Plan Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra yêu thích",
    });
  }
};
