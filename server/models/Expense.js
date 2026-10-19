const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  amount: { type: Number, required: true, min: 0.01 },
  category: { type: String, required: true, enum: ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Other'] },
  date: { type: Date, required: true },
  note: { type: String, trim: true, maxlength: 500, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
