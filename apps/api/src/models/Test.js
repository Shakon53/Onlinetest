import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  title: { ru: String, en: String, kk: String },
  durationMinutes: { type: Number, default: 15 },
  attemptsLimit: { type: Number, default: 2 },
  randomizeQuestions: { type: Boolean, default: true },
  passingPercent: { type: Number, default: 60 }
}, { timestamps: true });

export const Test = mongoose.model('Test', testSchema);
