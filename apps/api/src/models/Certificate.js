import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  certificateId: { type: String, required: true, unique: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  issuedAt: { type: Date, default: Date.now },
  pdfUrl: String,
  qrPayload: String,
  status: { type: String, enum: ['valid', 'revoked'], default: 'valid' }
}, { timestamps: true });

export const Certificate = mongoose.model('Certificate', certificateSchema);
