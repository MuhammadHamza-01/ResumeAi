import mongoose from "mongoose";

export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log("MongoDB connected");
};
