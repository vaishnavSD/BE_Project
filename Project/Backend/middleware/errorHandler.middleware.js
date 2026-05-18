// Global error handling middleware

export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);
  
  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: "Duplicate entry",
      message: "A record with this information already exists"
    });
  }
  
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      error: "Invalid reference",
      message: "Referenced record does not exist"
    });
  }
  
  if (err.code === 'ER_BAD_FIELD_ERROR') {
    return res.status(500).json({
      error: "Database schema error",
      message: "Database structure mismatch - migration may be required"
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: "Validation failed",
      message: err.message,
      details: err.details || []
    });
  }
  
  // Authentication errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired authentication"
    });
  }
  
  // Default error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(statusCode).json({
    error: err.name || 'Error',
    message: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.method} ${req.path} not found`
  });
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
