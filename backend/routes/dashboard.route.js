import express from 'express';
import authenticateToken from '../middleware/auth.token.js';
import {dashboardController} from '../controllers/dashboard.controller.js';

const router = express.Router();

router.get('/', authenticateToken, dashboardController);

export default router;