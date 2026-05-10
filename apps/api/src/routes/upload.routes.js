import fs from 'fs';
import multer from 'multer';
import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage, limits: { fileSize: 1024 * 1024 * 500 } });

router.post('/materials', requireAuth, requireRole('teacher', 'admin'), upload.single('file'), (req, res) => {
  res.status(201).json({ file: req.file, url: `/uploads/${req.file.filename}` });
});

export default router;
