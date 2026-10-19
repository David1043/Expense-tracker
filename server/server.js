require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10kb' }));
app.use((req, res, next) => {
  if (req.body === null || (req.body !== undefined && (typeof req.body !== 'object' || Array.isArray(req.body)))) {
    return res.status(400).json({ message: 'Request body must be a JSON object.' });
  }
  if (!req.body) req.body = {};
  next();
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' }
});
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use(errorHandler);

async function startServer() {
  try {
    if (!process.env.MONGO_URI) throw new Error('Set MONGO_URI in server/.env.');
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('replace_')) {
      throw new Error('Set JWT_SECRET to a random value of at least 32 characters.');
    }
    await mongoose.connect(process.env.MONGO_URI);
    // Wait for the unique email index before accepting registrations.
    const User = require('./models/User');
    await User.init();
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
}

startServer();
