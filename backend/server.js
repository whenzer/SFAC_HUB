import express from 'express';
import dotenv from 'dotenv';
import connectUsersDB from './config/users.db.js';
import userRoutes from './routes/user.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/user', userRoutes);

app.listen(PORT, () => {
  connectUsersDB();
  console.log(`Server is running on port ${PORT}`);
});