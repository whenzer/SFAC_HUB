import express from 'express';
import authenticateToken from '../middleware/auth.token.js';
import {stockreserveController, protectedController, dashboardController, stockController, reservationController } from '../controllers/protected.controller.js';
import {claimItemController,deleteCommentController, lostandfoundController, createPostController, likePostController, commentPostController, unlikePostController} from '../controllers/post.controller.js';

const router = express.Router();
//middleware
router.use(authenticateToken);
//routers
router.get('/', protectedController);

router.get('/dashboard', dashboardController);

router.get('/stock', stockController);
router.post('/stock/reserve',stockController, stockreserveController);

router.get('/reservations', reservationController);

router.get('/lostandfound', lostandfoundController);
router.post('/lostandfound/post', createPostController);
router.post('/lostandfound/:id/like', likePostController);
router.post('/lostandfound/:id/unlike', unlikePostController);
router.post('/lostandfound/:id/comment', commentPostController);
router.post('/lostandfound/:id/claim', claimItemController);
router.delete('/lostandfound/:postId/comment/:commentId', deleteCommentController);



export default router;