// Global error handler — catches any error thrown by route controllers
// and sends a clean JSON response back to the frontend.
// Note: Express needs all 4 params (err, req, res, next) to detect this
// as error middleware, even if req/next are unused.
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.name}: ${err.message}`);

  // Mongoose validation error (e.g. required field missing, regex didn't match)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: messages.join('. ') });
  }

  // Bad ObjectId in the URL (e.g. /api/customers/abc)
  if (err.name === 'CastError') {
    return res.status(404).json({ success: false, message: 'Resource not found — invalid ID format.' });
  }

  // Duplicate key (e.g. trying to create two customers with the same email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `A customer with this ${field} already exists.` });
  }

  // Anything else — generic 500 server error
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
};

export default errorHandler;
