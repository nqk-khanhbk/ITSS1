const userRouter = require("./user.routes");
const placeRouter = require("./place.routes");
const reviewRouter = require("./review.routes");
const commentRouter = require("./comment.routes");
const dayPlanRoutes = require("./dayPlan.routes");
const favoriteRouter = require("./favorite.routes"); // Thêm mới

function route(app) {
  // Route cho User
  app.use("/api/users", userRouter);

  // Route cho Place
  app.use("/api/places", placeRouter);

  // Route cho Review
  app.use("/api/reviews", reviewRouter);

  // Route cho Comment
  app.use("/api/comments", commentRouter);

  // Route cho Day Plan
  app.use("/api/day-plans", dayPlanRoutes);

  // Route cho Favorite (Thêm mới)
  app.use("/api/favorites", favoriteRouter);
}

module.exports = route;
