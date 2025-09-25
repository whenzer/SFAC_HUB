import express from 'express';
import { userRegister, userLogin, userLogout, userToken } from '../controllers/user.controller.js';
import authenticateLogin from '../middleware/auth.login.js';

const router = express.Router();

router.post('/register', userRegister);
router.post('/login',authenticateLogin, userLogin);
router.delete('/logout', userLogout);
router.post('/token', userToken);


export default router;