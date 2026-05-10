import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  text: { ru: String, en: String, kk: String },
  options: [{ ru: String, en: String, kk: String }],
  correctOptionIndex: { type: Number, required: true },
  points: { type: Number, default: 1 }
}, { timestamps: true });

export const Question = mongoose.model('Question', questionSchema);
