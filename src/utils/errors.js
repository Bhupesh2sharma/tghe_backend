class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function errorHandler(err, req, res, next) {
  // Ensure CORS header is set on error responses (in case cors middleware didn't run)
  const origin = req.get('origin');
  if (origin && (origin.includes('localhost') || origin.includes('tghe-frontend') || origin.includes('tghe.in') || origin.endsWith('.vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.details && { details: err.details }),
    });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.errors,
    });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID',
    });
  }
  if (err.name === 'MulterError') {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 10MB)' : err.message;
    return res.status(400).json({ success: false, error: message });
  }
  console.error(err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
}

module.exports = { ApiError, errorHandler };
