import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Course } from './models/Course.js';
import { Lesson } from './models/Lesson.js';
import { Test } from './models/Test.js';
import { Question } from './models/Question.js';
import { Progress } from './models/Progress.js';
import { Notification } from './models/Notification.js';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to MongoDB');

  // ─── USERS ───────────────────────────────────────────────────
  const userData = [
    { name: 'Administrator', email: 'admin@onlinetest.app', password: 'Admin@1234', role: 'admin', gpa: 4.0 },
    { name: 'Алия Нурланова', email: 'teacher1@onlinetest.app', password: 'Teacher@1234', role: 'teacher', gpa: 0 },
    { name: 'Данияр Абишев', email: 'teacher2@onlinetest.app', password: 'Teacher@1234', role: 'teacher', gpa: 0 },
    { name: 'Мария Ким', email: 'teacher3@onlinetest.app', password: 'Teacher@1234', role: 'teacher', gpa: 0 },
    { name: 'Aruzhan Seitkali', email: 'student@uni.kz', password: 'Student@1234', role: 'student', gpa: 3.95 },
    { name: 'Dias Kenzhebayev', email: 'dias@uni.kz', password: 'Student@1234', role: 'student', gpa: 3.87 },
    { name: 'Zarina Bekova', email: 'zarina@uni.kz', password: 'Student@1234', role: 'student', gpa: 3.75 },
    { name: 'Mikhail Ivanov', email: 'mikhail@uni.kz', password: 'Student@1234', role: 'student', gpa: 3.65 },
    { name: 'Nurlan Seilov', email: 'nurlan@uni.kz', password: 'Student@1234', role: 'student', gpa: 3.60 }
  ];

  const users = {};
  for (const u of userData) {
    let user = await User.findOne({ email: u.email });
    if (user) {
      console.log(`  SKIP: ${u.email}`);
    } else {
      const passwordHash = await bcrypt.hash(u.password, 12);
      user = await User.create({ name: u.name, email: u.email, passwordHash, role: u.role, gpa: u.gpa, emailVerified: true });
      console.log(`  CREATED: ${u.role} — ${u.email} / ${u.password}`);
    }
    users[u.email] = user;
  }
  console.log('✓ Users seeded\n');

  // ─── COURSES ─────────────────────────────────────────────────
  const courseData = [
    {
      slug: 'database-systems',
      title: { ru: 'Базы данных и информационные системы', en: 'Databases and Information Systems', kk: 'Деректер базасы және ақпараттық жүйелер' },
      description: { ru: 'Проектирование БД, SQL, нормализация и информационные системы предприятия.', en: 'Database design, SQL, normalization and enterprise information systems.', kk: 'ДБ жобалау, SQL, нормализация және кәсіпорын ақпараттық жүйелері.' },
      category: 'IT',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      teacher: users['teacher1@onlinetest.app']._id
    },
    {
      slug: 'hcia-datacom',
      title: { ru: 'Сетевые технологии HCIA Datacom', en: 'HCIA Datacom Network Technologies', kk: 'HCIA Datacom желілік технологиялары' },
      description: { ru: 'Маршрутизация, коммутация, VLAN, IPv6 и основы Huawei Datacom.', en: 'Routing, switching, VLAN, IPv6 and Huawei Datacom fundamentals.', kk: 'Маршруттау, коммутация, VLAN, IPv6 және Huawei Datacom негіздері.' },
      category: 'Network',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
      teacher: users['teacher2@onlinetest.app']._id
    },
    {
      slug: 'java-programming',
      title: { ru: 'Язык программирования Java', en: 'Java Programming Language', kk: 'Java бағдарламалау тілі' },
      description: { ru: 'ООП, коллекции, потоки, Spring Boot и backend-разработка.', en: 'OOP, collections, streams, Spring Boot and backend development.', kk: 'ООП, коллекциялар, ағындар, Spring Boot және backend әзірлеу.' },
      category: 'Programming',
      imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
      teacher: users['teacher1@onlinetest.app']._id
    },
    {
      slug: 'big-data-processing',
      title: { ru: 'Методы и системы обработки больших данных', en: 'Big Data Processing Methods and Systems', kk: 'Үлкен деректерді өңдеу әдістері мен жүйелері' },
      description: { ru: 'Hadoop, Spark, ETL, хранилища данных и пайплайны обработки.', en: 'Hadoop, Spark, ETL, data warehouses and processing pipelines.', kk: 'Hadoop, Spark, ETL, деректер қоймалары және өңдеу пайплайндары.' },
      category: 'Data',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      teacher: users['teacher3@onlinetest.app']._id
    },
    {
      slug: 'big-data-forecasting',
      title: { ru: 'Большие данные и прогнозирование', en: 'Big Data and Forecasting', kk: 'Үлкен деректер және болжау' },
      description: { ru: 'ML-модели, прогнозирование временных рядов и аналитика.', en: 'ML models, time series forecasting and analytics.', kk: 'ML модельдері, уақыттық қатарлар болжауы және аналитика.' },
      category: 'AI',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
      teacher: users['teacher3@onlinetest.app']._id
    }
  ];

  const courseMap = {};
  for (const cd of courseData) {
    let course = await Course.findOne({ 'title.en': cd.title.en });
    if (course) {
      console.log(`  SKIP course: ${cd.title.en}`);
    } else {
      course = await Course.create({ title: cd.title, description: cd.description, category: cd.category, imageUrl: cd.imageUrl, teacher: cd.teacher, published: true, rating: 4.7 + Math.random() * 0.3 });
      console.log(`  CREATED course: ${cd.title.en}`);
    }
    courseMap[cd.slug] = course;
  }
  console.log('✓ Courses seeded\n');

  // ─── LESSONS ─────────────────────────────────────────────────
  const lessonTemplates = [
    {
      order: 1,
      title: { ru: 'Введение и цели курса', en: 'Introduction and course goals', kk: 'Кіріспе және курс мақсаттары' },
      content: { ru: 'Обзор курса, цели обучения, требования и план.', en: 'Course overview, learning objectives, requirements and schedule.', kk: 'Курс шолуы, оқу мақсаттары, талаптар мен кесте.' }
    },
    {
      order: 2,
      title: { ru: 'Основные понятия и теория', en: 'Core concepts and theory', kk: 'Негізгі ұғымдар мен теория' },
      content: { ru: 'Фундаментальные концепции, терминология и теоретическая база.', en: 'Fundamental concepts, terminology and theoretical foundation.', kk: 'Негізгі ұғымдар, терминология және теориялық негіз.' }
    },
    {
      order: 3,
      title: { ru: 'Практическая работа', en: 'Practical assignment', kk: 'Практикалық жұмыс' },
      content: { ru: 'Применение теории на практике: упражнения и лабораторные работы.', en: 'Applying theory in practice: exercises and lab assignments.', kk: 'Теорияны практикада қолдану: жаттығулар мен зертханалық жұмыстар.' }
    },
    {
      order: 4,
      title: { ru: 'Продвинутые темы', en: 'Advanced topics', kk: 'Жоғары деңгей тақырыптары' },
      content: { ru: 'Углублённое изучение сложных случаев и оптимизации.', en: 'In-depth study of complex cases and optimization techniques.', kk: 'Күрделі жағдайлар мен оңтайландыру техникасын тереңдетіп зерттеу.' }
    },
    {
      order: 5,
      title: { ru: 'Итоговый проект и тест', en: 'Final project and test', kk: 'Қорытынды жоба мен тест' },
      content: { ru: 'Финальный проект, экзаменационный тест и обзор достижений.', en: 'Final project, exam test and achievements review.', kk: 'Қорытынды жоба, емтихан тесті және жетістіктерді шолу.' }
    }
  ];

  const lessonMap = {};
  for (const [slug, course] of Object.entries(courseMap)) {
    const existingLessons = await Lesson.countDocuments({ course: course._id });
    if (existingLessons > 0) {
      console.log(`  SKIP lessons for: ${slug}`);
      lessonMap[slug] = await Lesson.find({ course: course._id }).sort('order');
      continue;
    }
    const created = [];
    for (const lt of lessonTemplates) {
      const lesson = await Lesson.create({ course: course._id, title: lt.title, content: lt.content, order: lt.order, homework: { ru: 'Подготовьте отчёт о выполненной работе.', en: 'Prepare a report on completed work.', kk: 'Орындалған жұмыс туралы есеп дайындаңыз.' } });
      created.push(lesson);
    }
    lessonMap[slug] = created;
    console.log(`  CREATED ${created.length} lessons for: ${slug}`);
  }
  console.log('✓ Lessons seeded\n');

  // ─── TESTS & QUESTIONS ───────────────────────────────────────
  const questionSets = {
    'database-systems': [
      { text: { ru: 'Что такое первичный ключ?', en: 'What is a primary key?', kk: 'Бастапқы кілт дегеніміз не?' }, options: [{ ru: 'Уникальный идентификатор записи', en: 'Unique identifier for each record', kk: 'Жазбаның бірегей идентификаторы' }, { ru: 'Поле для пароля', en: 'Password field', kk: 'Құпия сөз өрісі' }, { ru: 'Внешняя ссылка', en: 'Foreign reference', kk: 'Сыртқы сілтеме' }, { ru: 'Индекс', en: 'Index', kk: 'Индекс' }], correct: 0 },
      { text: { ru: 'Какая команда SQL выбирает данные?', en: 'Which SQL command selects data?', kk: 'Қандай SQL командасы деректерді таңдайды?' }, options: [{ ru: 'INSERT', en: 'INSERT', kk: 'INSERT' }, { ru: 'UPDATE', en: 'UPDATE', kk: 'UPDATE' }, { ru: 'SELECT', en: 'SELECT', kk: 'SELECT' }, { ru: 'DELETE', en: 'DELETE', kk: 'DELETE' }], correct: 2 },
      { text: { ru: 'Что такое нормализация?', en: 'What is normalization?', kk: 'Нормалдандыру дегеніміз не?' }, options: [{ ru: 'Шифрование данных', en: 'Data encryption', kk: 'Деректерді шифрлау' }, { ru: 'Резервное копирование', en: 'Backup', kk: 'Резервтік көшіру' }, { ru: 'Устранение избыточности', en: 'Eliminating redundancy', kk: 'Артықтықты жою' }, { ru: 'Сжатие данных', en: 'Data compression', kk: 'Деректерді қысу' }], correct: 2 },
      { text: { ru: 'ACID расшифровывается как?', en: 'ACID stands for?', kk: 'ACID нені білдіреді?' }, options: [{ ru: 'Atomicity, Consistency, Isolation, Durability', en: 'Atomicity, Consistency, Isolation, Durability', kk: 'Atomicity, Consistency, Isolation, Durability' }, { ru: 'Auto, Complete, Isolated, Dynamic', en: 'Auto, Complete, Isolated, Dynamic', kk: 'Auto, Complete, Isolated, Dynamic' }, { ru: 'Atomic, Concurrent, Indexed, Durable', en: 'Atomic, Concurrent, Indexed, Durable', kk: 'Atomic, Concurrent, Indexed, Durable' }, { ru: 'Available, Consistent, Integrated, Distributed', en: 'Available, Consistent, Integrated, Distributed', kk: 'Available, Consistent, Integrated, Distributed' }], correct: 0 },
      { text: { ru: 'JOIN объединяет таблицы по?', en: 'JOIN combines tables by?', kk: 'JOIN кестелерді не бойынша біріктіреді?' }, options: [{ ru: 'Имени файла', en: 'File name', kk: 'Файл атауы' }, { ru: 'Связанным полям', en: 'Related fields', kk: 'Байланысты өрістер' }, { ru: 'Размеру таблицы', en: 'Table size', kk: 'Кесте өлшемі' }, { ru: 'Порядку строк', en: 'Row order', kk: 'Жол ретіне' }], correct: 1 }
    ],
    default: [
      { text: { ru: 'Вопрос 1 по теме курса', en: 'Question 1 on course topic', kk: 'Курс тақырыбы бойынша 1-сұрақ' }, options: [{ ru: 'Верный ответ', en: 'Correct answer', kk: 'Дұрыс жауап' }, { ru: 'Вариант 2', en: 'Option 2', kk: '2-нұсқа' }, { ru: 'Вариант 3', en: 'Option 3', kk: '3-нұсқа' }, { ru: 'Вариант 4', en: 'Option 4', kk: '4-нұсқа' }], correct: 0 },
      { text: { ru: 'Вопрос 2 по теме курса', en: 'Question 2 on course topic', kk: 'Курс тақырыбы бойынша 2-сұрақ' }, options: [{ ru: 'Вариант 1', en: 'Option 1', kk: '1-нұсқа' }, { ru: 'Верный ответ', en: 'Correct answer', kk: 'Дұрыс жауап' }, { ru: 'Вариант 3', en: 'Option 3', kk: '3-нұсқа' }, { ru: 'Вариант 4', en: 'Option 4', kk: '4-нұсқа' }], correct: 1 },
      { text: { ru: 'Вопрос 3 по теме курса', en: 'Question 3 on course topic', kk: 'Курс тақырыбы бойынша 3-сұрақ' }, options: [{ ru: 'Вариант 1', en: 'Option 1', kk: '1-нұсқа' }, { ru: 'Вариант 2', en: 'Option 2', kk: '2-нұсқа' }, { ru: 'Верный ответ', en: 'Correct answer', kk: 'Дұрыс жауап' }, { ru: 'Вариант 4', en: 'Option 4', kk: '4-нұсқа' }], correct: 2 }
    ]
  };

  for (const [slug, course] of Object.entries(courseMap)) {
    const existingTest = await Test.findOne({ course: course._id });
    if (existingTest) { console.log(`  SKIP test for: ${slug}`); continue; }

    const test = await Test.create({ course: course._id, title: { ru: 'Контрольный тест', en: 'Module Test', kk: 'Бақылау тесті' }, durationMinutes: 15, attemptsLimit: 2, randomizeQuestions: true, passingPercent: 60 });

    const qs = questionSets[slug] || questionSets.default;
    for (const q of qs) {
      await Question.create({
        test: test._id,
        text: q.text,
        options: q.options,
        correctOptionIndex: q.correct,
        points: 1
      });
    }
    console.log(`  CREATED test (${qs.length} questions) for: ${slug}`);
  }
  console.log('✓ Tests & questions seeded\n');

  // ─── PROGRESS ────────────────────────────────────────────────
  const studentEmails = ['student@uni.kz', 'dias@uni.kz', 'zarina@uni.kz'];
  for (const email of studentEmails) {
    const student = users[email];
    if (!student) continue;

    const courseList = Object.values(courseMap);
    for (let ci = 0; ci < Math.min(3, courseList.length); ci++) {
      const course = courseList[ci];
      const lessons = lessonMap[Object.keys(courseMap)[ci]] || [];
      const exists = await Progress.findOne({ student: student._id, course: course._id });
      if (exists) continue;

      const completedCount = Math.floor(Math.random() * (lessons.length + 1));
      const completedLessons = lessons.slice(0, completedCount).map((l) => l._id);
      const percent = Math.round((completedCount / lessons.length) * 100);

      await Progress.create({
        student: student._id,
        course: course._id,
        completedLessons,
        currentLesson: lessons[completedCount]?._id,
        percent,
        score: Math.floor(60 + Math.random() * 40),
        examAccess: percent >= 70,
        completedAt: percent === 100 ? new Date() : undefined
      });
    }
    console.log(`  CREATED progress records for: ${email}`);
  }
  console.log('✓ Progress seeded\n');

  // ─── NOTIFICATIONS ───────────────────────────────────────────
  const student = users['student@uni.kz'];
  if (student) {
    const existingNotif = await Notification.findOne({ user: student._id });
    if (!existingNotif) {
      await Notification.create([
        { user: student._id, title: { ru: 'Добро пожаловать!', en: 'Welcome!', kk: 'Қош келдіңіз!' }, message: { ru: 'Добро пожаловать на OnlineTest LMS. Начните обучение!', en: 'Welcome to OnlineTest LMS. Start learning today!', kk: 'OnlineTest LMS-ке қош келдіңіз. Оқуды бастаңыз!' }, type: 'system', read: false },
        { user: student._id, title: { ru: 'Новый урок', en: 'New lesson', kk: 'Жаңа сабақ' }, message: { ru: 'Доступен новый урок по базам данных.', en: 'New lesson on databases is available.', kk: 'Деректер базасы бойынша жаңа сабақ қол жетімді.' }, type: 'course', read: false },
        { user: student._id, title: { ru: 'Результат теста', en: 'Test result', kk: 'Тест нәтижесі' }, message: { ru: 'Тест завершён. Ваш результат: 88%.', en: 'Test completed. Your score: 88%.', kk: 'Тест аяқталды. Нәтижеңіз: 88%.' }, type: 'test', read: true }
      ]);
      console.log('  CREATED notifications for student');
    }
  }
  console.log('✓ Notifications seeded\n');

  await mongoose.disconnect();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('  Demo accounts:');
  console.log('  admin@onlinetest.app   / Admin@1234');
  console.log('  teacher1@onlinetest.app / Teacher@1234');
  console.log('  student@uni.kz         / Student@1234');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

seed().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
