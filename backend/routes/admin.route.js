import express from 'express';
import { adminController } from '../controllers/admin.controller.js';
import authenticateAdmin from '../middleware/auth.admin.js'
import { createProduct } from '../controllers/product.controller.js';

const router = express.Router();

router.use(authenticateAdmin);

router.post('/', adminController);
router.post('/createproduct', createProduct);

export default router;