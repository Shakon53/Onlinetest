export const courses = [
  {
    id: 'database-systems',
    category: 'IT',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    rating: 4.9,
    progress: 72,
    examAccess: true,
    translations: {
      ru: { title: 'Базы данных и информационные системы', teacher: 'Алия Нурланова', description: 'Проектирование БД, SQL, нормализация и информационные системы.' },
      en: { title: 'Databases and Information Systems', teacher: 'Aliya Nurlanova', description: 'Database design, SQL, normalization and information systems.' },
      kk: { title: 'Деректер базасы және ақпараттық жүйелер', teacher: 'Әлия Нұрланова', description: 'ДБ жобалау, SQL, нормализация және ақпараттық жүйелер.' }
    }
  },
  {
    id: 'hcia-datacom',
    category: 'Network',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
    rating: 4.8,
    progress: 48,
    examAccess: false,
    translations: {
      ru: { title: 'Сетевые технологии HCIA Datacom', teacher: 'Данияр Абишев', description: 'Маршрутизация, коммутация, VLAN, IPv6 и основы Huawei Datacom.' },
      en: { title: 'HCIA Datacom Network Technologies', teacher: 'Daniyar Abishev', description: 'Routing, switching, VLAN, IPv6 and Huawei Datacom fundamentals.' },
      kk: { title: 'HCIA Datacom желілік технологиялары', teacher: 'Данияр Әбішев', description: 'Маршруттау, коммутация, VLAN, IPv6 және Huawei Datacom негіздері.' }
    }
  },
  {
    id: 'java-programming',
    category: 'Programming',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
    rating: 4.7,
    progress: 86,
    examAccess: true,
    translations: {
      ru: { title: 'Язык программирования Java', teacher: 'Иван Петров', description: 'ООП, коллекции, потоки, Spring и backend-разработка.' },
      en: { title: 'Java Programming Language', teacher: 'Ivan Petrov', description: 'OOP, collections, streams, Spring and backend development.' },
      kk: { title: 'Java бағдарламалау тілі', teacher: 'Иван Петров', description: 'ООП, коллекциялар, ағындар, Spring және backend әзірлеу.' }
    }
  },
  {
    id: 'industrial-practice',
    category: 'Practice',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    rating: 4.6,
    progress: 35,
    examAccess: false,
    translations: {
      ru: { title: 'Производственная практика', teacher: 'Комиссия кафедры', description: 'Реальные проекты, отчеты, дневник практики и защита.' },
      en: { title: 'Industrial Practice', teacher: 'Department Board', description: 'Real projects, reports, practice diary and defense.' },
      kk: { title: 'Өндірістік практика', teacher: 'Кафедра комиссиясы', description: 'Нақты жобалар, есептер, практика күнделігі және қорғау.' }
    }
  },
  {
    id: 'big-data-processing',
    category: 'Data',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    rating: 4.9,
    progress: 58,
    examAccess: true,
    translations: {
      ru: { title: 'Методы и системы обработки больших данных', teacher: 'Мария Ким', description: 'Hadoop, Spark, ETL, хранилища данных и пайплайны.' },
      en: { title: 'Big Data Processing Methods and Systems', teacher: 'Maria Kim', description: 'Hadoop, Spark, ETL, data warehouses and pipelines.' },
      kk: { title: 'Үлкен деректерді өңдеу әдістері мен жүйелері', teacher: 'Мария Ким', description: 'Hadoop, Spark, ETL, деректер қоймалары және пайплайндар.' }
    }
  },
  {
    id: 'big-data-forecasting',
    category: 'AI',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    rating: 4.8,
    progress: 24,
    examAccess: false,
    translations: {
      ru: { title: 'Большие данные и прогнозирование', teacher: 'Ерлан Садыков', description: 'ML-модели, прогнозирование, временные ряды и аналитика.' },
      en: { title: 'Big Data and Forecasting', teacher: 'Yerlan Sadykov', description: 'ML models, forecasting, time series and analytics.' },
      kk: { title: 'Үлкен деректер және болжау', teacher: 'Ерлан Садықов', description: 'ML модельдері, болжау, уақыттық қатарлар және аналитика.' }
    }
  }
];

export const lessons = [
  { id: 1, title: { ru: 'Введение и цели курса', en: 'Introduction and course goals', kk: 'Кіріспе және курс мақсаттары' }, status: 'completed' },
  { id: 2, title: { ru: 'Основные понятия', en: 'Core concepts', kk: 'Негізгі ұғымдар' }, status: 'completed' },
  { id: 3, title: { ru: 'Практическая работа', en: 'Practical assignment', kk: 'Практикалық жұмыс' }, status: 'progress' },
  { id: 4, title: { ru: 'Контрольный мини-тест', en: 'Checkpoint quiz', kk: 'Бақылау мини-тесті' }, status: 'locked' },
  { id: 5, title: { ru: 'Итоговый проект', en: 'Final project', kk: 'Қорытынды жоба' }, status: 'locked' }
];
