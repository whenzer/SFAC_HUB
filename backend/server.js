import express from 'express';
import dotenv from 'dotenv';
import connectUsersDB from './config/users.db.js';
import userRoutes from './routes/user.route.js';
import adminRoutes from './routes/admin.route.js'
import { verifyAdmin } from './middleware/admin.verify.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/user', userRoutes);
app.use('/admin', verifyAdmin, adminRoutes);

app.listen(PORT, () => {
  connectUsersDB();
  console.log(`Server is running on port ${PORT}`);
});