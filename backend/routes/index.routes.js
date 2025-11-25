const userRouter = require("./user.routes");
const placeRouter = require("./place.routes"); // Import route place vừa tạo
const dayPlanRoutes = require("./dayPlan.routes");

function route(app) {
  // Định nghĩa các prefix cho route
  app.use("/api/users", userRouter);
  app.use("/api/places", placeRouter);
  app.use("/api/day-plans", dayPlanRoutes);
}

module.exports = route;
