import express from 'express';
import { userRegister, userLogin } from '../controllers/user.controller.js';
import authenticateLogin from '../middleware/auth.login.js';

const router = express.Router();

router.post('/register', userRegister);
router.post('/login',authenticateLogin, userLogin);

export default router;