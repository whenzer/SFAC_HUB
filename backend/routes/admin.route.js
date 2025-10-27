import express from 'express';
import { adminController, resetUserPassword, getAllUsers, verifyUser, deleteUser } from '../controllers/admin.controller.js';
import authenticateAdmin from '../middleware/auth.admin.js'
import { createProduct } from '../controllers/product.controller.js';

const router = express.Router();

router.use(authenticateAdmin);

router.get('/', adminController);
router.post('/createproduct', createProduct);
router.get('/users', getAllUsers);
router.put('/users/verify/:userId', verifyUser);
router.put('/users/reset-password/:userId', resetUserPassword);
router.delete('/users/delete/:userId', deleteUser);

export default router;