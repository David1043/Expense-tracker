const express = require('express');
const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');
const router = express.Router();
const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Other'];

function validateExpense(body) {
  const { title, amount, category, date, note } = body;
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 100) {
    return 'Title is required and must be at most 100 characters.';
  }
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return 'Amount must be a positive number.';
  }
  // Store money to the nearest paise and reject more than two decimal places.
  if (!Number.isSafeInteger(Math.round(amount * 100)) || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) {
    return 'Amount must have at most two decimal places and be within a safe range.';
  }
  if (!categories.includes(category)) return 'Please choose a valid category.';
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return 'Date must use YYYY-MM-DD format.';
  }
  const parsedDate = new Date(date + 'T00:00:00.000Z');
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
    return 'Please enter a valid calendar date.';
  }
  if (note !== undefined && (typeof note !== 'string' || note.length > 500)) {
    return 'Note must be text with at most 500 characters.';
  }
  return null;
}

function expenseFields(body) {
  return {
    title: body.title.trim(),
    amount: Math.round(body.amount * 100) / 100,
    category: body.category,
    date: new Date(body.date + 'T00:00:00.000Z'),
    note: (body.note || '').trim()
  };
}

router.use(auth);
router.param('id', (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return res.status(400).json({ message: 'Invalid expense ID.' });
  }
  next();
});

router.get('/', async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.userId }).sort({ date: -1, createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const message = validateExpense(req.body);
    if (message) return res.status(400).json({ message });
    const expense = await Expense.create({ ...expenseFields(req.body), user: req.userId });
    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const message = validateExpense(req.body);
    if (message) return res.status(400).json({ message });
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: expenseFields(req.body) },
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ message: 'Expense not found.' });
    res.json(expense);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!expense) return res.status(404).json({ message: 'Expense not found.' });
    res.json({ message: 'Expense deleted.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
