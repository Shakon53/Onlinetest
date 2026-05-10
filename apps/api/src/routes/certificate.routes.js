import { Router } from 'express';
import { Certificate } from '../models/Certificate.js';
import { Progress } from '../models/Progress.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { buildCertificatePdfStream, issueCertificate } from '../services/certificateService.js';

const router = Router();

router.post('/courses/:courseId/issue', requireAuth, asyncHandler(async (req, res) => {
  const progress = await Progress.findOne({ student: req.user._id, course: req.params.courseId }).populate('course');
  if (!progress || progress.percent < 100) return res.status(403).json({ message: 'Course is not completed' });
  const certificate = await issueCertificate({ student: req.user._id, course: req.params.courseId });
  res.status(201).json({ certificate });
}));

router.get('/:certificateId/verify', asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({ certificateId: req.params.certificateId }).populate('student course');
  if (!certificate) return res.status(404).json({ message: 'Certificate not found' });
  res.json({ certificate });
}));

router.get('/:certificateId/pdf', asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({ certificateId: req.params.certificateId }).populate('student course');
  if (!certificate) return res.status(404).json({ message: 'Certificate not found' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=${certificate.certificateId}.pdf`);
  buildCertificatePdfStream({ studentName: certificate.student.name, courseTitle: certificate.course.title.en || certificate.course.title.ru, certificateId: certificate.certificateId }).pipe(res);
}));

export default router;
