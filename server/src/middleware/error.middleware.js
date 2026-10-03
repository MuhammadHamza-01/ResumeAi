export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  if (err.code === 11000) {
    statusCode = 409;
    message = "Email is already registered";
  }

  if (statusCode === 500 && process.env.NODE_ENV === "production") {
    message = "Something went wrong";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
