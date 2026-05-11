'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

// Knowledge base for instant responses
const KB = [
  { keys: ['sql', 'select', 'запрос'], answer: 'SQL SELECT — основная команда чтения данных: `SELECT поля FROM таблица WHERE условие ORDER BY поле LIMIT n`. Для агрегации используйте GROUP BY + HAVING.' },
  { keys: ['join', 'джойн', 'объединение таблиц'], answer: 'JOIN объединяет таблицы:\n• INNER JOIN — только совпадающие строки\n• LEFT JOIN — все левые + совпадающие правые\n• RIGHT JOIN — все правые + совпадающие левые\n• FULL OUTER JOIN — все строки обеих таблиц' },
  { keys: ['индекс', 'index', 'производительность'], answer: 'Индекс ускоряет поиск с O(n) до O(log n). Создать: `CREATE INDEX idx_name ON table(column)`. Используйте на часто используемых в WHERE/JOIN/ORDER BY колонках. Замедляет INSERT/UPDATE/DELETE.' },
  { keys: ['транзакция', 'acid', 'commit', 'rollback'], answer: 'Транзакция — набор операций "всё или ничего". ACID: Atomicity, Consistency, Isolation, Durability. Команды: BEGIN → операции → COMMIT (сохранить) или ROLLBACK (отменить).' },
  { keys: ['нормализация', 'нормальная форма', '1нф', '2нф', '3нф'], answer: '1НФ: атомарные значения\n2НФ: полная зависимость от всего PK\n3НФ: нет транзитивных зависимостей (A→B→C)\nЦель: каждый факт хранится в одном месте.' },
  { keys: ['osi', 'уровень', 'модель'], answer: '7 уровней OSI снизу вверх: Физический(1) → Канальный(2) → Сетевой(3) → Транспортный(4) → Сеансовый(5) → Представления(6) → Прикладной(7). IP=L3, TCP=L4, HTTP=L7.' },
  { keys: ['ip', 'подсеть', 'cidr', 'маска'], answer: 'CIDR нотация: /24 = 254 хоста, /25 = 126, /26 = 62, /27 = 30. Частные сети: 192.168.0.0/16, 172.16.0.0/12, 10.0.0.0/8. Broadcast = последний адрес подсети.' },
  { keys: ['tcp', 'udp', 'порт'], answer: 'TCP: надёжный, 3-way handshake (SYN→SYN-ACK→ACK). UDP: быстрый, без гарантий. Порты: HTTP=80, HTTPS=443, SSH=22, DNS=53, SMTP=25, FTP=21.' },
  { keys: ['java', 'класс', 'объект', 'ооп'], answer: 'ООП в Java: Класс = шаблон, Объект = экземпляр. 4 принципа: Инкапсуляция (private+геттеры), Наследование (extends), Полиморфизм (переопределение), Абстракция (abstract/interface).' },
  { keys: ['exception', 'исключение', 'try catch'], answer: 'try-catch-finally: try=код, catch=обработка исключения, finally=всегда выполняется. Checked (IOException) — обязательная обработка. Unchecked (RuntimeException) — не обязательна.' },
  { keys: ['stream', 'lambda', 'коллекция'], answer: 'Stream API: filter(pred) → map(func) → sorted() → collect(). Lambda: (a,b) -> a+b. Method reference: System.out::println. Ленивые операции — не выполняются до терминального.' },
  { keys: ['spark', 'hadoop', 'rdd', 'dataframe'], answer: 'Apache Spark работает в памяти (до 100x быстрее Hadoop). RDD = базовая абстракция, DataFrame = структурированные данные. Lazy evaluation: трансформации не выполняются до action (collect, show, count).' },
  { keys: ['kafka', 'стриминг', 'topic'], answer: 'Kafka — распределённый брокер сообщений. Компоненты: Producer → Topic/Partition → Consumer Group. Offset = позиция сообщения (можно перечитывать). Kafka Connect — коннекторы к внешним системам.' },
  { keys: ['etl', 'extract', 'transform', 'load'], answer: 'ETL: Extract (из источников: БД, API, файлы) → Transform (очистка, нормализация, агрегация) → Load (в DW или Data Lake). Форматы: Parquet (колоночный, лучше для аналитики), ORC, Avro.' },
  { keys: ['машинное обучение', 'ml', 'регрессия', 'классификация'], answer: 'Типы ML: Supervised (с метками: регрессия, классификация), Unsupervised (без меток: кластеризация). Проблемы: Overfitting (переобучение) — решение: регуляризация, dropout, больше данных.' },
  { keys: ['git', 'коммит', 'ветка', 'branch'], answer: 'Git: git add → git commit -m "feat: описание" → git push. Ветки: git branch feature/x, git checkout feature/x, git merge. Conventional Commits: feat:, fix:, docs:, refactor:' },
  { keys: ['scrum', 'agile', 'спринт', 'kanban'], answer: 'Scrum: роли PO/SM/DevTeam, события Sprint Planning/Daily(15мин)/Review/Retrospective. Story Points = сложность. Kanban: визуальная доска, WIP-лимиты, непрерывный поток без спринтов.' },
  { keys: ['vlan', 'switch', 'коммутатор'], answer: 'VLAN — логическая сегментация сети. Access порт = один VLAN. Trunk порт = несколько VLAN с тегами 802.1Q. STP предотвращает петли. Inter-VLAN routing — нужен Router или L3-switch.' },
];

function getAnswer(question) {
  const q = question.toLowerCase();
  for (const entry of KB) {
    if (entry.keys.some(k => q.includes(k))) return entry.answer;
  }
  return null;
}

const SUGGESTIONS = [
  'Что такое SQL JOIN?',
  'Объясни ACID транзакции',
  'Как работает TCP/IP?',
  'Что такое ООП в Java?',
  'Расскажи про Apache Spark',
  'Как работает Kafka?',
  'Что такое нормализация БД?',
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: '👋 Привет! Я AI-ассистент вашей платформы. Задавайте вопросы по темам курсов — SQL, Сети, Java, Big Data, ML и др.!', time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  function send(text) {
    const q = text || input.trim();
    if (!q) return;
    setInput('');

    const userMsg = { role: 'user', text: q, time: new Date() };
    setMessages(m => [...m, userMsg]);
    setLoading(true);

    setTimeout(() => {
      const kb = getAnswer(q);
      const answer = kb ||
        `По запросу "${q}" рекомендую изучить соответствующий урок курса. Используйте поиск по разделам теории и практики. Если вопрос конкретный — сформулируйте его точнее, включив ключевое слово темы.`;

      setMessages(m => [...m, { role: 'bot', text: answer, time: new Date() }]);
      setLoading(false);
    }, 600 + Math.random() * 400);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function fmtTime(d) {
    return d?.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 ${open ? 'bg-slate-700 dark:bg-slate-600' : 'bg-gradient-to-br from-brand-500 to-violet-600'}`}
        aria-label="AI Ассистент"
      >
        {open ? <X className="text-white" size={22} /> : <Sparkles className="text-white" size={22} />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[520px] flex flex-col rounded-3xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-brand-600 to-violet-600 text-white flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">AI-ассистент</p>
              <p className="text-xs opacity-70">Эксперт по курсам платформы</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs opacity-70">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${msg.role === 'bot' ? 'bg-gradient-to-br from-brand-500 to-violet-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  {msg.role === 'bot' ? <Bot size={14} className="text-white" /> : <User size={14} className="text-slate-600 dark:text-slate-300" />}
                </div>
                <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'bot'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm'
                      : 'bg-brand-600 text-white rounded-tr-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-xs text-slate-400 mt-0.5 px-1">{fmtTime(msg.time)}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-3 py-2">
                  <Loader2 size={16} className="animate-spin text-brand-500" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto flex-shrink-0">
              {SUGGESTIONS.slice(0, 4).map(s => (
                <button key={s} onClick={() => send(s)}
                  className="flex-shrink-0 text-xs rounded-full bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 px-3 py-1.5 hover:bg-brand-100 dark:hover:bg-brand-950/50 border border-brand-200 dark:border-brand-900">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Задайте вопрос..."
              className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
