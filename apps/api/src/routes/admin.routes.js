import { Router } from 'express';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Certificate } from '../models/Certificate.js';
import { Progress } from '../models/Progress.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/analytics', asyncHandler(async (req, res) => {
  const [users, courses, certificates, progress] = await Promise.all([User.countDocuments(), Course.countDocuments(), Certificate.countDocuments(), Progress.countDocuments()]);
  res.json({ users, courses, certificates, progressRecords: progress });
}));

router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find().select('-passwordHash').sort('-createdAt');
  res.json({ users });
}));

router.patch('/users/:id/block', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'blocked' }, { new: true }).select('-passwordHash');
  res.json({ user });
}));

router.patch('/certificates/:id/revoke', asyncHandler(async (req, res) => {
  const certificate = await Certificate.findByIdAndUpdate(req.params.id, { status: 'revoked' }, { new: true });
  res.json({ certificate });
}));

export default router;
