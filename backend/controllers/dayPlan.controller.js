const DayPlan = require("../models/dayPlan.model");
const Place = require("../models/place.model");
const Like = require("../models/like.model");

// GET /api/day-plans - Lấy danh sách day plans với thông tin chi tiết, tìm kiếm và lọc
module.exports.list = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
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

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get day plans with populated data
    const dayPlans = await DayPlan.find(filter)
      .populate("user_id", "fullName avatar")
      .populate("items.place_id")
      .skip(skip)
      .limit(limitNum)
      .sort({ created_at: -1 })
      .lean();

    const total = await DayPlan.countDocuments(filter);

    // Process each day plan to get required output
    const results = await Promise.all(
      dayPlans.map(async (dayPlan) => {
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

        // Filter by price range - khoảng giá của dayPlan phải nằm trong khoảng user yêu cầu
        if ((price_min || price_max) && shouldInclude) {
          const minPrice = price_min ? parseInt(price_min) : 0;
          const maxPrice = price_max ? parseInt(price_max) : Infinity;

          // Check if dayPlan's price range [totalMinPrice, totalMaxPrice] fits within requested range [minPrice, maxPrice]
          if (hasPrice) {
            // DayPlan's range must be within requested range
            if (totalMinPrice < minPrice || totalMaxPrice > maxPrice) {
              shouldInclude = false;
            }
          } else {
            // If dayPlan is free, it fits any budget
            // Free (0) is always within any price range
          }
        }

        // Filter by age limit - giao tuổi của dayPlan phải nằm trong tuổi user yêu cầu
        if ((age_min !== undefined || age_max !== undefined) && shouldInclude) {
          const minAge = age_min !== undefined ? parseInt(age_min) : 0;
          const maxAge = age_max !== undefined ? parseInt(age_max) : Infinity;

          // Check if dayPlan's age intersection [ageMin, ageMax] fits within requested range [minAge, maxAge]
          if (ageMin !== null && ageMax !== null) {
            // There is an age intersection
            if (ageMax < ageMin) {
              // No valid intersection (incompatible)
              shouldInclude = false;
            } else {
              // Check if dayPlan's age intersection fits within requested range
              if (ageMin < minAge || ageMax > maxAge) {
                shouldInclude = false;
              }
            }
          } else if (ageMin !== null) {
            // Only lower bound exists
            if (ageMin < minAge) {
              shouldInclude = false;
            }
          } else if (ageMax !== null) {
            // Only upper bound exists
            if (ageMax > maxAge) {
              shouldInclude = false;
            }
          }
          // If both ageMin and ageMax are null, it means "Mọi lứa tuổi" - always include (fits any age range)
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
    const filteredResults = results.filter((r) => r !== null);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      message: "Lấy danh sách thành công",
      data: filteredResults,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        filteredCount: filteredResults.length,
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
