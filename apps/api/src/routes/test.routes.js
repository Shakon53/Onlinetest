import { Router } from 'express';
import { Question } from '../models/Question.js';
import { Test } from '../models/Test.js';
import { Progress } from '../models/Progress.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, requireRole('Teacher', 'Admin'), asyncHandler(async (req, res) => {
  const test = await Test.create(req.body);
  res.status(201).json({ test });
}));

router.post('/:testId/questions', requireAuth, requireRole('Teacher', 'Admin'), asyncHandler(async (req, res) => {
  const question = await Question.create({ ...req.body, test: req.params.testId });
  res.status(201).json({ question });
}));

router.get('/:testId/start', requireAuth, asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.testId);
  const questions = await Question.find({ test: req.params.testId }).select('-correctOptionIndex');
  const randomized = test.randomizeQuestions ? questions.sort(() => Math.random() - 0.5) : questions;
  res.json({ test, questions: randomized });
}));

router.post('/:testId/submit', requireAuth, asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.testId);
  const questions = await Question.find({ test: req.params.testId });
  const answers = req.body.answers || [];
  const checked = questions.map((question) => {
    const answer = answers.find((item) => item.question === question._id.toString());
    return { question: question._id, selectedOptionIndex: answer?.selectedOptionIndex, correct: answer?.selectedOptionIndex === question.correctOptionIndex };
  });
  const correctAnswers = checked.filter((item) => item.correct).length;
  const scorePercent = Math.round((correctAnswers / questions.length) * 100);
  const progress = await Progress.findOneAndUpdate(
    { student: req.user._id, course: test.course },
    { $setOnInsert: { student: req.user._id, course: test.course } },
    { upsert: true, new: true }
  );
  const attemptsCount = progress.attempts.filter((attempt) => attempt.test?.toString() === req.params.testId).length;
  if (attemptsCount >= test.attemptsLimit) return res.status(429).json({ message: 'Attempts limit reached' });
  progress.attempts.push({ test: test._id, scorePercent, correctAnswers, totalQuestions: questions.length, answers: checked, completedAt: new Date() });
  progress.score = Math.max(progress.score, scorePercent);
  await progress.save();
  res.json({ scorePercent, correctAnswers, totalQuestions: questions.length, passed: scorePercent >= test.passingPercent });
}));

export default router;
