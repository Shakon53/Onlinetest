'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Paperclip, Send, X } from 'lucide-react';
import { Shell } from '../../components/Shell';
import { useI18n } from '../../components/I18nProvider';
import { getSession } from '../../lib/api';

const CONTACTS = [
  { id: 1, name: 'Алия Нурланова', role: 'teacher', online: true, avatar: 'А', lastMsg: 'Хорошая работа!', unread: 2 },
  { id: 2, name: 'Данияр Абишев', role: 'teacher', online: false, avatar: 'Д', lastMsg: 'Лекция загружена.', unread: 0 },
  { id: 3, name: 'Мария Ким', role: 'teacher', online: true, avatar: 'М', lastMsg: 'Задание проверено.', unread: 1 },
  { id: 4, name: 'Support', role: 'admin', online: true, avatar: 'S', lastMsg: 'Как я могу помочь?', unread: 0 }
];

const INITIAL_MESSAGES = {
  1: [
    { id: 1, from: 'them', text: 'Здравствуйте! Как дела с домашним заданием?', time: '10:00' },
    { id: 2, from: 'me', text: 'Работаю над третьим заданием.', time: '10:05' },
    { id: 3, from: 'them', text: 'Хорошая работа! Если есть вопросы, пишите.', time: '10:07' }
  ],
  2: [
    { id: 1, from: 'them', text: 'Новая лекция по VLAN загружена.', time: 'Вчера' },
    { id: 2, from: 'me', text: 'Спасибо, посмотрю сегодня!', time: 'Вчера' }
  ],
  3: [
    { id: 1, from: 'them', text: 'Ваше задание по Spark проверено. Оценка: 90%.', time: '09:30' }
  ],
  4: [
    { id: 1, from: 'them', text: 'Привет! Как я могу помочь?', time: '09:00' }
  ]
};

const AUTO_REPLIES = [
  'Понял, отвечу позже.',
  'Хорошо! Спасибо за сообщение.',
  'Рассмотрю ваш вопрос в ближайшее время.',
  'Уточните, пожалуйста, подробности.',
  'Отличный вопрос! Дам ответ сегодня.'
];

export default function ChatPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [contacts, setContacts] = useState(CONTACTS);
  const [showSidebar, setShowSidebar] = useState(true);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const session = getSession();
    if (!session) { router.replace('/auth/login'); return; }
    setUser(session);
  }, [router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeId]);

  function openChat(id) {
    setActiveId(id);
    setShowSidebar(false);
    // mark as read
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, unread: 0 } : c));
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function closeChatMobile() {
    setShowSidebar(true);
    setActiveId(null);
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || !activeId) return;
    const now = new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
    const newMsg = { id: Date.now(), from: 'me', text: input.trim(), time: now };
    const msgText = input.trim();
    setMessages((prev) => ({ ...prev, [activeId]: [...(prev[activeId] || []), newMsg] }));
    setContacts((prev) => prev.map((c) => c.id === activeId ? { ...c, lastMsg: msgText } : c));
    setInput('');

    // Simulated auto-reply
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        from: 'them',
        text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => ({ ...prev, [activeId]: [...(prev[activeId] || []), reply] }));
      setContacts((prev) => prev.map((c) => c.id === activeId ? { ...c, lastMsg: reply.text } : c));
    }, 1000 + Math.random() * 1000);
  }

  if (!user) return null;

  const activeContact = CONTACTS.find((c) => c.id === activeId);
  const activeMessages = messages[activeId] || [];
  const totalUnread = contacts.reduce((s, c) => s + c.unread, 0);

  return (
    <Shell>
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-black">{t.chat}</h1>
          {totalUnread > 0 && (
            <span className="rounded-full bg-brand-600 px-3 py-1 text-sm font-bold text-white">
              {totalUnread} unread
            </span>
          )}
        </div>

        <div
          className="glass overflow-hidden rounded-3xl"
          style={{ height: 'calc(100svh - 200px)', minHeight: '520px' }}
        >
          <div className="flex h-full">
            {/* ── SIDEBAR ── */}
            <div
              className={`flex flex-col border-r border-white/30 dark:border-white/10 transition-all duration-300 ${
                showSidebar
                  ? 'w-full sm:w-72 flex-shrink-0'
                  : 'hidden sm:flex sm:w-72 flex-shrink-0'
              }`}
            >
              <div className="border-b border-white/30 px-4 py-3 dark:border-white/10">
                <p className="font-bold text-slate-700 dark:text-slate-200">Messages</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => openChat(contact.id)}
                    className={`flex w-full items-center gap-3 p-4 text-left transition ${
                      activeId === contact.id && !showSidebar
                        ? 'bg-brand-50 dark:bg-brand-950/30'
                        : 'hover:bg-white/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 font-bold text-white">
                        {contact.avatar}
                      </div>
                      {contact.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-semibold">{contact.name}</p>
                        {contact.unread > 0 && (
                          <span className="ml-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                            {contact.unread}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate-500">{contact.lastMsg}</p>
                      <p className={`text-xs ${contact.online ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {contact.online ? t.online : t.offline} · {contact.role}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── CHAT AREA ── */}
            <div
              className={`flex min-w-0 flex-1 flex-col ${
                showSidebar ? 'hidden sm:flex' : 'flex'
              }`}
            >
              {activeId ? (
                <>
                  {/* Chat header */}
                  <div className="flex items-center gap-3 border-b border-white/30 bg-white/50 px-4 py-3 dark:border-white/10 dark:bg-slate-900/30">
                    {/* Back button (mobile) */}
                    <button onClick={closeChatMobile} className="rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 sm:hidden">
                      <ArrowLeft size={20} />
                    </button>
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 font-bold text-white">
                        {activeContact?.avatar}
                      </div>
                      {activeContact?.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold">{activeContact?.name}</p>
                      <p className="text-xs text-slate-500">
                        {activeContact?.online ? t.online : t.offline} · {activeContact?.role}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    {activeMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                        {msg.from !== 'me' && (
                          <div className="mr-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-purple-600 text-xs font-bold text-white self-end">
                            {activeContact?.avatar}
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            msg.from === 'me'
                              ? 'bg-brand-600 text-white rounded-br-sm'
                              : 'bg-white shadow-sm dark:bg-slate-800 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <p className={`mt-0.5 text-xs ${msg.from === 'me' ? 'text-white/60' : 'text-slate-400'}`}>
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={endRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-white/30 bg-white/50 px-4 py-3 dark:border-white/10 dark:bg-slate-900/30">
                    <button type="button" className="rounded-xl bg-white p-2.5 shadow-sm dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
                      <Paperclip size={16} className="text-slate-400" />
                    </button>
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) sendMessage(e); }}
                      placeholder={t.typeMessage}
                      className="flex-1 rounded-2xl border-0 bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="rounded-2xl bg-brand-600 p-2.5 text-white transition hover:bg-brand-500 disabled:opacity-40"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </>
              ) : (
                /* Empty state */
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <MessageCircle size={56} className="mb-4 text-slate-300" />
                  <p className="text-xl font-bold text-slate-500">Select a conversation</p>
                  <p className="mt-2 text-sm text-slate-400">Choose a contact from the list to start chatting</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
