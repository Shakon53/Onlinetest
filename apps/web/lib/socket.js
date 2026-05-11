'use client';

import { useEffect, useRef, useState } from 'react';

let socketInstance = null;

function getSocket() {
  if (typeof window === 'undefined') return null;
  if (!socketInstance) {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
    // Dynamic import to avoid SSR issues
    import('socket.io-client').then(({ io }) => {
      socketInstance = io(apiUrl, { autoConnect: false, reconnectionDelay: 2000 });
    }).catch(() => {});
  }
  return socketInstance;
}

export function useSocket(userId) {
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId || typeof window === 'undefined') return;

    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

    import('socket.io-client').then(({ io }) => {
      const socket = io(API_URL, { transports: ['websocket', 'polling'] });
      socketRef.current = socket;

      socket.on('connect', () => {
        setConnected(true);
        socket.emit('join:user', userId);
      });

      socket.on('disconnect', () => setConnected(false));

      socket.on('notification', (payload) => {
        setNotifications((prev) => [{ ...payload, id: Date.now() }, ...prev].slice(0, 20));
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }).catch(() => {});
  }, [userId]);

  function sendMessage(to, text, from) {
    socketRef.current?.emit('chat:message', { to, text, from });
  }

  return { connected, notifications, sendMessage };
}
