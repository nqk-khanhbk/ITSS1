const userRoutes = require('./user.routes');

module.exports = (app) => {
  app.use('/user', userRoutes);
}
