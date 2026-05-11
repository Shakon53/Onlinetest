import dotenv from 'dotenv';
dotenv.config({ path: new URL('../.env', import.meta.url) });
import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }
});

io.on('connection', (socket) => {
  socket.on('join:user', (userId) => socket.join(`user:${userId}`));
  socket.on('progress:update', (payload) => {
    io.to(`user:${payload.userId}`).emit('notification', { type: 'progress', payload });
  });
  socket.on('chat:message', (payload) => {
    io.to(`user:${payload.to}`).emit('chat:message', payload);
  });
});

const port = process.env.PORT || 5000;

server.listen(port, async () => {
  console.log(`API running on http://localhost:${port}`);
  try {
    await connectDatabase();
  } catch (error) {
    console.error('MongoDB connection failed. API is running, but database endpoints require MongoDB.', error.message);
  }
});
