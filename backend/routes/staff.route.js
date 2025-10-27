import express from 'express';
import authenticateStaff from '../middleware/auth.staff.js'
import { staffController, collectOrderController } from '../controllers/staff.controller.js';
import { deleteProduct, createProduct, restockProduct, setTotalStock, getAllReservations } from '../controllers/product.controller.js';
const router = express.Router();
//middleware
router.use(authenticateStaff);
//routers
router.get('/', staffController);
router.post('/products/create', createProduct);
router.put('/products/restock', restockProduct);
router.put('/products/set-total-stock', setTotalStock);
router.delete('/products/delete/:productId', deleteProduct);
router.get('/reservations', getAllReservations);
router.put('/reservations/:reservationId/collect', collectOrderController);

export default router;