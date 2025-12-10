const User = require("../models/user.model");

module.exports.requireAuth = async (req, res, next) => {
  // Kiểm tra req.cookies tồn tại
  if (!req.cookies || !req.cookies.token) {
    return res.status(401).json({
      code: 401,
      message: "Unauthorized - No token provided",
    });
  }

  try {
    const user = await User.findOne({
      tokenUser: req.cookies.token,
    }).select("-password");

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: "Unauthorized - Invalid token",
      });
    }

    res.locals.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "Server error",
      error: error.message,
    });
  }
};
