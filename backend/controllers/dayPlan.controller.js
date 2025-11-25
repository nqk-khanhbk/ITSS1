const DayPlan = require("../models/dayPlan.model");
const Place = require("../models/place.model");
const Like = require("../models/like.model");

// GET /api/public/day-plans - Lấy danh sách day plans công khai với thông tin chi tiết
module.exports.list = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      tags,
      province,
      district,
      price_min,
      price_max,
      age_min,
      age_max,
    } = req.query;

    // Build filter
    const filter = {};

    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

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

        // Apply filters if provided
        let shouldInclude = true;

        if (province && !provinces.has(province)) {
          shouldInclude = false;
        }

        if (district && !areas.has(district)) {
          shouldInclude = false;
        }

        if (price_min && totalMaxPrice < parseInt(price_min)) {
          shouldInclude = false;
        }

        if (price_max && totalMinPrice > parseInt(price_max)) {
          shouldInclude = false;
        }

        if (
          age_min !== undefined &&
          ageMax !== null &&
          ageMax < parseInt(age_min)
        ) {
          shouldInclude = false;
        }

        if (
          age_max !== undefined &&
          ageMin !== null &&
          ageMin > parseInt(age_max)
        ) {
          shouldInclude = false;
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
    console.error("Get public day plans error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
