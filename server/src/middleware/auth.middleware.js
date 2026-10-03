import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../utils/apiError.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError("Not authorized, no token", 401);
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw new ApiError("Not authorized, invalid token", 401);
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError("User not found", 401);
    }

    req.user = {
      id: user._id.toString(),
    };

    next();
  } catch (error) {
    next(error);
  }
};
