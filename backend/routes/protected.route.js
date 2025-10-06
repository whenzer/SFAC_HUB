import express from 'express';
import authenticateToken from '../middleware/auth.token.js';
import {cancelreservationController,stockreserveController, protectedController, dashboardController, stockController, reservationController } from '../controllers/protected.controller.js';
import {deletePostController,resolvedController, claimItemController,deleteCommentController, updateCommentController, lostandfoundController, createPostController, likePostController, commentPostController, unlikePostController} from '../controllers/post.controller.js';

const router = express.Router();
//middleware
router.use(authenticateToken);
//routers
router.get('/', protectedController);

router.get('/dashboard', dashboardController);

router.get('/stock', stockController);
router.post('/stock/reserve',stockController, stockreserveController);

router.get('/reservations', reservationController);
router.put('/reservations/:reservationId/cancel', cancelreservationController);

router.get('/lostandfound', lostandfoundController);
router.post('/lostandfound/post', createPostController);
router.post('/lostandfound/:id/like', likePostController);
router.post('/lostandfound/:id/unlike', unlikePostController);
router.post('/lostandfound/:id/comment', commentPostController);
router.post('/lostandfound/:id/claim', claimItemController);
router.delete('/lostandfound/:postId/comment/:commentId', deleteCommentController);
router.put('/lostandfound/:postId/comment/:commentId', updateCommentController);
router.put('/lostandfound/:id/resolve', resolvedController);
router.delete('/lostandfound/:id', deletePostController);



export default router;