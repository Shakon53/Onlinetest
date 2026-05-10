import mongoose from 'mongoose';

const localizedStringSchema = new mongoose.Schema({ ru: String, en: String, kk: String }, { _id: false });

const courseSchema = new mongoose.Schema({
  title: { type: localizedStringSchema, required: true },
  description: { type: localizedStringSchema, required: true },
  category: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: String,
  rating: { type: Number, default: 0 },
  published: { type: Boolean, default: false },
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  tags: [{ type: String }]
}, { timestamps: true });

export const Course = mongoose.model('Course', courseSchema);
