const mongoose = require('mongoose');

const questionDetailSchema = new mongoose.Schema({
  question: String,
  userAnswer: String,
  correctAnswer: String,
  isCorrect: Boolean,
  timeTakenMs: Number
});

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizType: { type: String, required: true },
  totalScore: { type: Number, required: true },
  totalTime: { type: Number, required: true }, // in milliseconds
  questionsDetail: [questionDetailSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', sessionSchema);
