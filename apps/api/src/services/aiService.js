export async function recommendCourses({ user, courses }) {
  return courses.slice(0, 6).map((course, index) => ({ course, score: 100 - index * 7, reason: 'Matched by progress, role and topic interest' }));
}

export async function generateTestQuestions({ topic, count = 5 }) {
  return Array.from({ length: count }, (_, index) => ({
    text: {
      ru: `AI вопрос ${index + 1}: ${topic}`,
      en: `AI question ${index + 1}: ${topic}`,
      kk: `AI сұрақ ${index + 1}: ${topic}`
    },
    options: [
      { ru: 'Вариант A', en: 'Option A', kk: 'A нұсқасы' },
      { ru: 'Вариант B', en: 'Option B', kk: 'B нұсқасы' },
      { ru: 'Вариант C', en: 'Option C', kk: 'C нұсқасы' },
      { ru: 'Вариант D', en: 'Option D', kk: 'D нұсқасы' }
    ],
    correctOptionIndex: 0
  }));
}
