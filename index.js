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

const app = express();
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
};
app.use(cors(corsOptions));
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
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
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority',
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected! Retrying...');
  connectDB();
});

if (process.env.NODE_ENV !== 'production') {
  const startServer = async () => {
    await connectDB();
    server.listen(process.env.PORT || 3000, () => {
      console.log(
        `🚀 Server running on http://localhost:${process.env.PORT || 3000}`
      );
    });
  };
  startServer();
}

export { io };
export default app;
