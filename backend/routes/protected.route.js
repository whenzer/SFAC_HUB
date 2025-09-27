import express from 'express';
import authenticateToken from '../middleware/auth.token.js';
import {stockreserveController, protectedController, dashboardController, lostandfoundController, stockController, reservationController } from '../controllers/protected.controller.js';

const router = express.Router();
//middleware
router.use(authenticateToken);
//routers
router.get('/', protectedController);

router.get('/dashboard', dashboardController);

router.get('/stock', stockController);
router.post('/stock/reserve',stockController, stockreserveController);

router.get('/reservation', reservationController);

router.get('/lostandfound', lostandfoundController);

export default router;