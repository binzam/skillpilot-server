import User from "../models/userModel.js";

const authorizeRole = (role) => {
  return async (req, res, next) => {
    const user = await User.findById(req.user.userId);
    if (!user || role !== user.role) {
      return res.status(403).json({
        message: 'Unauthorized',
      });
    }
    next();
  };
};

export default authorizeRole;
