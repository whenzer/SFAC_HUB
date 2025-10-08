import express from 'express';
import authenticateStaff from '../middleware/auth.staff.js'
import { staffController } from '../controllers/staff.controller.js';
import { createProduct, restockProduct, setTotalStock } from '../controllers/product.controller.js';
const router = express.Router();
//middleware
router.use(authenticateStaff);
//routers
router.get('/', staffController);
router.post('/products/create', createProduct);
router.put('/products/restock', restockProduct);
router.put('/products/set-total-stock', setTotalStock);

export default router;