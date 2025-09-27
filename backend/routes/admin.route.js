import express from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { createProduct } from '../controllers/product.controller.js';

const router = express.Router();

router.post('/', adminController);
router.post('/createproduct', createProduct);

export default router;