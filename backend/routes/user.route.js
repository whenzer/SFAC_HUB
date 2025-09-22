import express from 'express';
import { userRegister, userLogin, verifyUserFormat } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', verifyUserFormat, userRegister);
router.post('/login', userLogin);

export default router;