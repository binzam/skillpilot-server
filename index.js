import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';
import roadmapRoutes from './routes/roadmapRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import userRoutes from './routes/userRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import http from 'http';
import { Server } from 'socket.io';
// import { clearAllNotifications, clearAllQuizes } from './utils/resetUtils.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
};
app.use(cors(corsOptions));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});
app.get('/', (req, res) => {
  res.send('SkillPilot server');
});
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/notifications', notificationRoutes);
io.on('connection', (socket) => {
  console.log('User connected ', socket.id);
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`${userId} joined the room`);
  });
  socket.on('send_notification', (userId, notificationData) => {
    io.to(userId).emit('notification', notificationData);
  });
});

mongoose
  .connect(process.env.MONGO_URI || '')
  .then(() => {
    console.log('✅ App connected to database');
    if (require.main === module) {
      const url = `http://localhost:${process.env.PORT}`;
      server.listen(process.env.PORT, () => {
        console.log(`✅ App listening on: \x1b[32m%s\x1b[0m`, url);
      });
    }
    // clearAllNotifications()
    // clearAllQuizes()
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error.message);
    process.exit(1);
  });
export { io };
export default server;
