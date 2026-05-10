import { Router } from 'express';
import { Course } from '../models/Course.js';
import { Progress } from '../models/Progress.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { recommendCourses } from '../services/aiService.js';

const router = Router();

router.get('/student', requireAuth, asyncHandler(async (req, res) => {
  const progress = await Progress.find({ student: req.user._id }).populate('course');
  const courses = await Course.find({ published: true }).limit(12);
  const recommendations = await recommendCourses({ user: req.user, courses });
  const average = progress.length ? Math.round(progress.reduce((sum, item) => sum + item.score, 0) / progress.length) : 0;
  res.json({ currentScore: average, gpa: req.user.gpa, progress, recommendations });
}));

export default router;
