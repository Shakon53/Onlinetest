import { Router } from 'express';
import { Course } from '../models/Course.js';
import { Progress } from '../models/Progress.js';
import { User } from '../models/User.js';
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

router.get('/leaderboard', asyncHandler(async (req, res) => {
  const allProgress = await Progress.find().populate('student', 'name email role');
  const scoreMap = {};
  for (const p of allProgress) {
    if (!p.student || p.student.role !== 'student') continue;
    const id = p.student._id.toString();
    if (!scoreMap[id]) scoreMap[id] = { name: p.student.name, email: p.student.email, totalScore: 0, count: 0, lessons: 0 };
    scoreMap[id].totalScore += p.percent || p.score || 0;
    scoreMap[id].count += 1;
    scoreMap[id].lessons += p.completedLessons?.length || 0;
  }
  const leaderboard = Object.values(scoreMap)
    .filter(s => s.lessons > 0)
    .map(s => ({ name: s.name, email: s.email, score: s.count > 0 ? Math.round(s.totalScore / s.count) : 0, lessons: s.lessons }))
    .sort((a, b) => b.lessons - a.lessons || b.score - a.score)
    .slice(0, 10);
  res.json({ leaderboard });
}));

export default router;
