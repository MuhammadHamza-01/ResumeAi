import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { ApiError } from "../utils/apiError.js";

const formatUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      throw new ApiError("Email is already registered", 409);
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      throw new ApiError("Invalid email or password", 401);
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new ApiError("Invalid email or password", 401);
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    res.json({
      success: true,
      message: "Profile fetched successfully",
      data: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      throw new ApiError("Name is required", 400);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};
