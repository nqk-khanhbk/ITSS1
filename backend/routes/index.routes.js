const userRouter = require('./user.routes');
const placeRouter = require('./place.routes');
const reviewRouter = require('./review.routes'); // 1. Import Review Route
const dayPlanRoutes = require("./dayPlan.routes");

function route(app) {
  // Route cho User
  app.use('/api/users', userRouter);

  // Route cho Place
  app.use('/api/places', placeRouter);
  
  // 2. Đăng ký Route cho Review
  // URL gốc sẽ là /api/reviews
  app.use('/api/reviews', reviewRouter);
  app.use("/api/day-plans", dayPlanRoutes);
}

module.exports = route;
