import mongoose from 'mongoose';

const localizedStringSchema = new mongoose.Schema({ ru: String, en: String, kk: String }, { _id: false });

const lessonSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: localizedStringSchema, required: true },
  content: { type: localizedStringSchema, default: {} },
  order: { type: Number, required: true },
  videoUrl: String,
  pdfFiles: [{ title: String, url: String }],
  presentations: [{ title: String, url: String }],
  homework: { type: localizedStringSchema, default: {} },
  miniTest: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' }
}, { timestamps: true });

lessonSchema.index({ course: 1, order: 1 }, { unique: true });

export const Lesson = mongoose.model('Lesson', lessonSchema);
