import { Router } from 'express';
import { z } from 'zod';
import { Course } from '../models/Course.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { generateTestQuestions, recommendCourses } from '../services/aiService.js';

const router = Router();

router.get('/recommendations', requireAuth, asyncHandler(async (req, res) => {
  const courses = await Course.find({ published: true });
  const recommendations = await recommendCourses({ user: req.user, courses });
  res.json({ recommendations });
}));

router.post('/generate-test', requireAuth, requireRole('teacher', 'admin'), asyncHandler(async (req, res) => {
  const { topic, count } = z.object({ topic: z.string().min(2), count: z.number().min(1).max(50).default(5) }).parse(req.body);
  const questions = await generateTestQuestions({ topic, count });
  res.json({ questions });
}));

export default router;
