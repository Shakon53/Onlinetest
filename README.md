# OnlineTest LMS

Полноценная современная LMS-платформа для онлайн-обучения, тестирования и управления студентами. Поддерживает три языка, строгую последовательность уроков, автоматическую проверку тестов, сертификаты с QR-кодом и полные панели Teacher / Admin.

---

## Стек технологий

| Слой | Технология |
|------|-----------|
| Frontend | Next.js 15 · React 19 · Tailwind CSS |
| Backend | Node.js · Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Realtime | Socket.IO |
| Charts | Recharts |
| PDF | PDFKit |
| QR | qrcode · qrcode.react |
| i18n | Русский · English · Қазақша |

---

## Быстрый старт

### 1. Предварительные требования

- Node.js ≥ 18
- MongoDB (локально или [MongoDB Atlas](https://www.mongodb.com/atlas))

### 2. Клонирование и установка

```bash
git clone <repo-url>
cd onlinetest

# Установить все зависимости (monorepo)
npm install
```

### 3. Настройка переменных окружения (Backend)

Создайте файл `apps/api/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/onlinetest_lms
JWT_SECRET=your-super-secret-jwt-key-change-me
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
UPLOAD_DIR=uploads
```

### 4. Настройка Frontend

Создайте файл `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 5. Заполнить базу данных тестовыми пользователями

```bash
cd apps/api
npm run seed
```

Создаются пользователи:

| Email | Пароль | Роль |
|-------|--------|------|
| admin@onlinetest.app | Admin@1234 | Admin |
| teacher1@onlinetest.app | Teacher@1234 | Teacher |
| teacher2@onlinetest.app | Teacher@1234 | Teacher |

### 6. Запустить оба приложения

```bash
# Из корня monorepo
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health

---

## Структура проекта

```
onlinetest/
├── apps/
│   ├── api/                     # Express + MongoDB backend
│   │   └── src/
│   │       ├── config/          # MongoDB connection
│   │       ├── middleware/      # auth, error handler
│   │       ├── models/          # Mongoose schemas
│   │       ├── routes/          # API route handlers
│   │       ├── services/        # certificateService, aiService
│   │       ├── utils/           # JWT, asyncHandler
│   │       ├── app.js           # Express app factory
│   │       ├── server.js        # HTTP + Socket.IO server
│   │       └── seed.js          # Database seeder
│   └── web/                     # Next.js frontend
│       ├── app/
│       │   ├── page.jsx         # Главная страница (Hero, курсы, отзывы)
│       │   ├── auth/
│       │   │   ├── login/       # Страница входа
│       │   │   └── register/    # Страница регистрации
│       │   ├── courses/
│       │   │   ├── page.jsx     # Каталог курсов (поиск, фильтры, категории)
│       │   │   └── [id]/
│       │   │       ├── page.jsx # Плеер урока (locked/in-progress/completed)
│       │   │       └── test/    # Онлайн тест с таймером и авто-проверкой
│       │   ├── dashboard/       # Dashboard студента (статистика, прогресс, чарты)
│       │   ├── profile/         # Профиль, достижения, редактирование
│       │   ├── leaderboard/     # Лидерборд с подиумом топ-3
│       │   ├── notifications/   # Уведомления с пометкой "прочитано"
│       │   ├── chat/            # Чат с преподавателем (realtime UI)
│       │   ├── certificate/     # Сертификат с QR + PDF скачивание
│       │   ├── teacher/
│       │   │   ├── page.jsx     # Teacher Panel (курсы, AI генератор, статистика)
│       │   │   └── create/      # 3-шаговый мастер создания курса+урока+теста
│       │   └── admin/
│       │       ├── page.jsx     # Admin Panel (статистика, панели)
│       │       ├── users/       # Управление пользователями, блокировка
│       │       └── analytics/   # Аналитика: тренды, completion rate, диаграммы
│       ├── components/
│       │   ├── Shell.jsx        # Layout с адаптивной навигацией
│       │   ├── CourseCard.jsx   # Карточка курса
│       │   └── I18nProvider.jsx # Провайдер i18n
│       └── lib/
│           ├── api.js           # HTTP клиент с JWT
│           ├── data.js          # Статические данные (fallback)
│           └── i18n.js          # Словари ru/en/kk
└── package.json                 # Monorepo scripts
```

---

## Страницы и функции

### Публичные страницы
| Путь | Описание |
|------|----------|
| `/` | Hero section, популярные курсы, отзывы, статистика |
| `/courses` | Каталог с поиском, фильтрами по категории и сортировкой |
| `/courses/[id]` | Плеер урока: видео, материалы, PDF, домашнее задание, тест |
| `/auth/login` | JWT-авторизация с редиректом по роли |
| `/auth/register` | Регистрация student/teacher |

### Студент (требует авторизации)
| Путь | Описание |
|------|----------|
| `/dashboard` | Статистика, GPA, чарт прогресса, мини-лидерборд, курсы |
| `/courses/[id]/test` | Тест с таймером, random вопросы, автопроверка |
| `/profile` | Профиль, редактирование, достижения, статистика курсов |
| `/leaderboard` | Глобальный рейтинг с подиумом и стриками |
| `/notifications` | Push-уведомления с пометкой прочитанных |
| `/chat` | Чат с преподавателями (realtime UI) |
| `/certificate` | Просмотр, скачивание и выдача сертификата с QR |

### Teacher Panel
| Путь | Описание |
|------|----------|
| `/teacher` | Обзор: курсы, AI-генератор тестов, статистика студентов, drag&drop builder |
| `/teacher/create` | 3-шаговый wizard: курс → урок → тест с вопросами |

### Admin Panel
| Путь | Описание |
|------|----------|
| `/admin` | Главная с быстрой статистикой и навигацией |
| `/admin/users` | Таблица пользователей: поиск, фильтр по роли, блокировка |
| `/admin/analytics` | Enrollment trend, completion rates, role distribution, recent activity |

---

## API Endpoints

### Auth
```
POST /api/auth/register        # { name, email, password, role, preferredLanguage }
POST /api/auth/login           # { email, password }
POST /api/auth/forgot-password # { email }
GET  /api/auth/me              # Bearer token required
```

### Courses & Lessons
```
GET  /api/courses                                       # Список опубликованных курсов
POST /api/courses                                       # Создать курс (teacher/admin)
GET  /api/courses/:id                                   # Курс + уроки
POST /api/courses/:id/lessons                           # Добавить урок (teacher/admin)
POST /api/courses/:courseId/lessons/:lessonId/complete  # Завершить урок (строгая очередь)
```

### Tests
```
POST /api/tests                      # Создать тест (teacher/admin)
POST /api/tests/:testId/questions    # Добавить вопрос
GET  /api/tests/:testId/start        # Начать тест (вопросы без ответов)
POST /api/tests/:testId/submit       # Сдать тест (автопроверка + сохранение)
```

### Dashboard
```
GET /api/dashboard/student           # GPA, прогресс, AI рекомендации
```

### Certificates
```
POST /api/certificates/courses/:courseId/issue    # Выдать сертификат (100% курса)
GET  /api/certificates/:certificateId/verify      # Верификация по ID
GET  /api/certificates/:certificateId/pdf         # PDF сертификат
```

### Admin
```
GET   /api/admin/analytics              # Статистика платформы
GET   /api/admin/users                  # Все пользователи
PATCH /api/admin/users/:id/block        # Заблокировать
PATCH /api/admin/certificates/:id/revoke # Аннулировать сертификат
```

### AI
```
GET  /api/ai/recommendations            # AI рекомендации курсов
POST /api/ai/generate-test              # AI генерация вопросов { topic, count }
```

### Other
```
POST /api/uploads/materials             # Загрузить файл (teacher/admin)
GET  /api/notifications                 # Уведомления пользователя
PATCH /api/notifications/:id/read       # Отметить прочитанным
```

---

## Правило строгой последовательности уроков

Бэкенд в `POST /api/courses/:courseId/lessons/:lessonId/complete` проверяет:

- Все предыдущие уроки должны быть завершены
- Если нет → HTTP 423 (Locked)
- После 70% завершения курса → `examAccess: true`
- После 100% → `completedAt` + выдача сертификата

Frontend отображает три состояния:
- ✅ **Completed** — зелёный
- ▶️ **In progress** — синий
- 🔒 **Locked** — серый, кнопка отключена

---

## WebSocket события (Socket.IO)

```js
// Подписаться на уведомления
socket.emit('join:user', userId);

// Получить уведомление
socket.on('notification', ({ type, payload }) => { ... });

// Отправить сообщение в чат
socket.emit('chat:message', { to: userId, text, from });

// Получить сообщение
socket.on('chat:message', (payload) => { ... });
```

---

## MongoDB схемы

| Модель | Поля |
|--------|------|
| User | name, email, passwordHash, role, status, preferredLanguage, gpa, achievements |
| Course | title(i18n), description(i18n), category, teacher, imageUrl, rating, published |
| Lesson | course, title(i18n), content(i18n), order, videoUrl, pdfFiles, homework, miniTest |
| Test | course, lesson, title(i18n), durationMinutes, attemptsLimit, passingPercent |
| Question | test, text(i18n), options(i18n array), correctOptionIndex, points |
| Progress | student, course, completedLessons, percent, score, examAccess, attempts[] |
| Certificate | certificateId, student, course, issuedAt, qrPayload, status |
| Notification | user, type, text(i18n), read, createdAt |

---

## Развёртывание в production

Подробная инструкция: `README_DEPLOY.md`

**Рекомендуемый стек:**
- **Frontend**: Vercel (`apps/web`)
- **Backend**: Render (`apps/api`)
- **Database**: MongoDB Atlas

**Чеклист перед деплоем:**
- [ ] Изменить `JWT_SECRET` на надёжный ключ
- [ ] Настроить MongoDB Atlas URI
- [ ] Настроить `CLIENT_URL` и `CORS_ORIGINS`
- [ ] Подключить email-провайдер (nodemailer/Resend)
- [ ] Переместить загрузки на S3 (AWS/Cloudflare R2)
- [ ] Подключить реальный AI (OpenAI / Anthropic) в `aiService.js`
- [ ] Включить HTTPS
- [ ] Добавить rate limiting для `POST /api/auth/*`

---

## Авторы и лицензия

Разработано как учебная LMS-платформа. MIT License.
