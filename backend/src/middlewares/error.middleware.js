const { ZodError } = require('zod');

/**
 * Global Express error handler.
 * Handles Zod validation errors, custom statusCode errors, and generic 500s.
 */
const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
  });
};

module.exports = { errorHandler };
