import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import adminRoutes from './routes/admin.route.js';
import protectedRoutes from './routes/protected.route.js';
import cors from 'cors';
import { configureCloudinary } from './config/cloudinary.js';
import http from 'http'; // 👈 for creating a server
import { Server } from 'socket.io'; // 👈 import Socket.io

dotenv.config();
configureCloudinary();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Create an HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://sfac-hub-bq7y.vercel.app',
      'http://localhost:5173'
    ],
    credentials: true
  }
});

// --- Socket.io logic ---
io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  // Listen for "newComment" event from frontend
  socket.on('newComment', (data) => {
    console.log('💬 New comment received:', data);

    // Broadcast the comment to all connected clients
    io.emit('updateComments', data);
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});


// cors is for allowing frontend to access backend
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://sfac-hub-bq7y.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true 
}));

app.use(express.json({ limit: '5mb' }));
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', protectedRoutes);
app.use('/protected', protectedRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});