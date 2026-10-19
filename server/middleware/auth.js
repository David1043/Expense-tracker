const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Please log in to continue.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (!decoded || typeof decoded !== 'object' || !mongoose.isValidObjectId(decoded.id)) {
      return res.status(401).json({ message: 'Invalid token. Please log in again.' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Session expired or invalid. Please log in again.' });
  }

  try {
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Account not found. Please log in again.' });
    req.userId = user.id;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = auth;
