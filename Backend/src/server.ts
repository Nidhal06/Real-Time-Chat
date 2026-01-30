import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import authRoutes from './routes/authRoutes';
import roomRoutes from './routes/roomRoutes';
import messageRoutes from './routes/messageRoutes';
import invitationRoutes from './routes/invitationRoutes';
import { errorHandler } from './middleware/errorHandler';
import { initializeSocket } from './socket';
import { initializeFirebase } from './config/firebase';

dotenv.config();

const app = express();
const server = http.createServer(app);

try {
  initializeFirebase();
  console.log('Firebase Admin initialized');
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK', error);
  process.exit(1);
}

const allowedOrigins = process.env.CLIENT_URL?.split(',').map((origin) => origin.trim()) ?? [
  'http://localhost:5173',
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use((_req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.send('Backend is running 🚀');
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/invitations', invitationRoutes);

app.use('*', (_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

initializeSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
