// Middleware for handling 404 Not Found errors
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass the error to the next middleware (our custom error handler)
};

// Generic error handling middleware
const errorHandler = (err, req, res, next) => {
  // If status code is 200 (OK), it means an error occurred but was not explicitly set to a non-200 status
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    // In development, send stack trace for debugging
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };