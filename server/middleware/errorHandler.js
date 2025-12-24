const errorHandler = (err, req, res, next) => {
  console.error('Error Handler - Full Error:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    name: err.name
  });

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Database errors
  if (err.code === '23505') {
    statusCode = 409;
    message = 'Duplicate entry';
  } else if (err.code === '23503') {
    statusCode = 400;
    message = 'Foreign key constraint violation';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Database connection refused. Please check your database configuration.';
  } else if (err.code === 'ENOTFOUND') {
    statusCode = 503;
    message = `Database host not found: ${err.hostname || 'unknown'}`;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  // Ensure response hasn't been sent
  if (!res.headersSent) {
    res.status(statusCode).json({
      success: false,
      error: message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        details: err.toString()
      })
    });
  }
};

module.exports = {
  errorHandler
};

