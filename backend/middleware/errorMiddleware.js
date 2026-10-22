// 404 for unknown API routes
const notFound = (req, res) => {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
};

// Last-resort error handler (Express 5 forwards rejected promises here too)
// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id' });
  }

  console.error('Unhandled error:', error);
  res.status(error.status || 500).json({ message: 'Server error' });
};

module.exports = { notFound, errorHandler };
