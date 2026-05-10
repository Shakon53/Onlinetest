# OnlineTest LMS

Современная образовательная LMS-платформа для онлайн-обучения, тестирования студентов, прогресса, сертификатов и панелей Teacher/Admin.

## Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB
- Auth: JWT, bcrypt
- Realtime: Socket.IO
- i18n: Русский, English, Қазақша

## Deployment

Production deployment guide is available in:

```text
README_DEPLOY.md
```

Recommended production stack:

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## Structure

```text
apps/
  web/   Next.js frontend
  api/   Express + MongoDB backend
```

## Quick start

1. Install dependencies:

```bash
npm install
npm run install:all
```

2. Create backend env file:

```bash
cp apps/api/.env.example apps/api/.env
```

3. Start MongoDB locally or set `MONGODB_URI`.

4. Run both apps:

```bash
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:5001/api/health

## Frontend pages

- `/` — landing page with hero, statistics, categories, popular courses and testimonials
- `/courses` — searchable course catalog
- `/courses/[id]` — course player with locked/completed/in-progress lesson states
- `/dashboard` — student dashboard with grades, GPA, progress cards, leaderboard and chart
- `/teacher` — teacher panel with course creation, upload and drag & drop lesson builder UI
- `/admin` — admin panel for users, courses, certificates, analytics and languages
- `/certificate` — certificate preview with QR verification
- `/auth/login` and `/auth/register` — authentication UI

## Backend API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `GET /api/auth/me`
- `GET /api/courses`
- `POST /api/courses`
- `GET /api/courses/:id`
- `POST /api/courses/:id/lessons`
- `POST /api/courses/:courseId/lessons/:lessonId/complete`
- `POST /api/tests`
- `POST /api/tests/:testId/questions`
- `GET /api/tests/:testId/start`
- `POST /api/tests/:testId/submit`
- `GET /api/dashboard/student`
- `POST /api/certificates/courses/:courseId/issue`
- `GET /api/certificates/:certificateId/verify`
- `GET /api/certificates/:certificateId/pdf`
- `GET /api/admin/analytics`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/block`
- `PATCH /api/admin/certificates/:id/revoke`
- `POST /api/uploads/materials`
- `GET /api/ai/recommendations`
- `POST /api/ai/generate-test`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

## Learning sequence rule

The backend enforces strict lesson order in:

`POST /api/courses/:courseId/lessons/:lessonId/complete`

A student can complete a lesson only when all previous lessons in the same course are completed. The frontend displays:

- `Completed`
- `In progress`
- `Locked lesson`

## Production hardening checklist

- Replace `JWT_SECRET` with a strong secret
- Use MongoDB Atlas or a managed MongoDB instance
- Connect real email provider for verification and password reset
- Move uploads to S3-compatible storage
- Connect a real AI provider inside `apps/api/src/services/aiService.js`
- Add payment/enrollment rules if the platform becomes commercial
- Add automated tests and CI/CD

## Features included

- Multilingual UI with language persistence
- Landing page, courses, dashboard, course player
- Student progress states: locked, in progress, completed
- Auth endpoints with JWT and bcrypt
- Role-ready user model: Student, Teacher, Admin
- MongoDB schemas for users, courses, lessons, tests, questions, progress, certificates and notifications
- Teacher/Admin API scaffolding
- Certificate generation endpoint with unique certificate ID and QR payload
- Upload endpoints for video/PDF/presentation materials
- Socket.IO notification channel
- AI recommendation and AI test generation placeholder services

## Notes

AI features are implemented as service placeholders so you can connect OpenAI, local LLM, or another provider without exposing API keys in frontend code.
