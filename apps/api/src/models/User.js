import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  preferredLanguage: { type: String, enum: ['ru', 'en', 'kk'], default: 'ru' },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  emailVerified: { type: Boolean, default: false },
  gpa: { type: Number, default: 0 },
  achievements: [{ type: String }]
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
