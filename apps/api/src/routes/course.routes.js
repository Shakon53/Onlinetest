import { Router } from 'express';
import { Course } from '../models/Course.js';
import { Lesson } from '../models/Lesson.js';
import { Progress } from '../models/Progress.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const courses = await Course.find({ published: true }).populate('teacher', 'name');
  res.json({ courses });
}));

router.post('/', requireAuth, requireRole('Teacher', 'Admin'), asyncHandler(async (req, res) => {
  const course = await Course.create({ ...req.body, teacher: req.user._id });
  res.status(201).json({ course });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('teacher', 'name');
  const lessons = await Lesson.find({ course: req.params.id }).sort('order');
  res.json({ course, lessons });
}));

router.post('/:id/lessons', requireAuth, requireRole('Teacher', 'Admin'), asyncHandler(async (req, res) => {
  const lesson = await Lesson.create({ ...req.body, course: req.params.id });
  res.status(201).json({ lesson });
}));

router.post('/:courseId/lessons/:lessonId/complete', requireAuth, asyncHandler(async (req, res) => {
  const lessons = await Lesson.find({ course: req.params.courseId }).sort('order');
  const currentIndex = lessons.findIndex((lesson) => lesson._id.toString() === req.params.lessonId);
  if (currentIndex === -1) return res.status(404).json({ message: 'Lesson not found' });
  const previousLessons = lessons.slice(0, currentIndex).map((lesson) => lesson._id.toString());
  const progress = await Progress.findOneAndUpdate(
    { student: req.user._id, course: req.params.courseId },
    { $setOnInsert: { student: req.user._id, course: req.params.courseId } },
    { upsert: true, new: true }
  );
  const completedSet = new Set(progress.completedLessons.map((id) => id.toString()));
  const canComplete = previousLessons.every((id) => completedSet.has(id));
  if (!canComplete) return res.status(423).json({ message: 'Previous lesson must be completed first' });
  completedSet.add(req.params.lessonId);
  const percent = Math.round((completedSet.size / lessons.length) * 100);
  progress.completedLessons = [...completedSet];
  progress.currentLesson = lessons[Math.min(currentIndex + 1, lessons.length - 1)]?._id;
  progress.percent = percent;
  progress.examAccess = percent >= 70;
  progress.completedAt = percent === 100 ? new Date() : undefined;
  await progress.save();
  res.json({ progress });
}));

export default router;
