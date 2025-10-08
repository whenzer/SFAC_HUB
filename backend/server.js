import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import adminRoutes from './routes/admin.route.js';
import staffRoutes from './routes/staff.route.js';
import protectedRoutes from './routes/protected.route.js';
import { configureCloudinary } from './config/cloudinary.js';

dotenv.config();
configureCloudinary();

const app = express();
const PORT = process.env.PORT;
if (!PORT) {
  console.error("Error: PORT is not defined in environment variables.");
  process.exit(1);
}

// ✅ create HTTP server
const server = http.createServer(app);

// ✅ initialize socket.io on that server
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://sfac-hub-bq7y.vercel.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});
setInterval(() => io.emit('ping', { time: Date.now() }), 25000);
// ✅ middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://sfac-hub-bq7y.vercel.app'
  ],
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.set('io', io); // Make io accessible in routes if needed
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/protected', protectedRoutes);

// ✅ IMPORTANT: use server.listen instead of app.listen
server.listen(PORT,"0.0.0.0", () => console.log(`🚀 Server live on port ${PORT}`));