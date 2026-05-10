import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { ru: String, en: String, kk: String },
  message: { ru: String, en: String, kk: String },
  type: { type: String, enum: ['system', 'course', 'test', 'certificate', 'chat'], default: 'system' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
