import mongoose from 'mongoose';

const testAttemptSchema = new mongoose.Schema({
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  scorePercent: Number,
  correctAnswers: Number,
  totalQuestions: Number,
  answers: [{ question: mongoose.Schema.Types.ObjectId, selectedOptionIndex: Number, correct: Boolean }],
  completedAt: Date
}, { _id: false });

const progressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  currentLesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  percent: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  examAccess: { type: Boolean, default: false },
  attempts: [testAttemptSchema],
  completedAt: Date
}, { timestamps: true });

progressSchema.index({ student: 1, course: 1 }, { unique: true });

export const Progress = mongoose.model('Progress', progressSchema);
