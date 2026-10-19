function errorHandler(error, req, res, next) {
  if (error.code === 11000) {
    return res.status(400).json({ message: 'This email is already registered.' });
  }
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map(item => item.message).join(' ');
    return res.status(400).json({ message });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID or field value.' });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large.' });
  }
  console.error(error);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
}

module.exports = errorHandler;
