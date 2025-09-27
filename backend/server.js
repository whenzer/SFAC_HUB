import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import adminRoutes from './routes/admin.route.js';
import protectedRoutes from './routes/protected.route.js';
import cors from 'cors';
import { configureCloudinary } from './config/cloudinary.js';

dotenv.config();
configureCloudinary();
const app = express();
const PORT = process.env.PORT || 3000;
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