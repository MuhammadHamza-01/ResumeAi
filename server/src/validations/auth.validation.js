import { ApiError } from "../utils/apiError.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegister = (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      throw new ApiError("Name is required", 400);
    }

    if (!email || !email.trim()) {
      throw new ApiError("Email is required", 400);
    }

    if (!emailRegex.test(email)) {
      throw new ApiError("Please enter a valid email", 400);
    }

    if (!password) {
      throw new ApiError("Password is required", 400);
    }

    if (password.length < 6) {
      throw new ApiError("Password must be at least 6 characters", 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      throw new ApiError("Email is required", 400);
    }

    if (!password) {
      throw new ApiError("Password is required", 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};
