export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Something went wrong"
      : err.message || "Something went wrong";

  res.status(statusCode).json({
    success: false,
    message,
  });
};
