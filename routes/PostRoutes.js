import express from 'express';
import {
    getAll,
    getPost,
    addPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost
} from '../controllers/PostController.js';
import { ProtectMiddleware, AuthMiddleware } from '../middleware/ProtectMiddleware.js';
import CommentRoutes from './CommentRoutes.js';
import multer from 'multer';

const router = express.Router();

const storage =multer.memoryStorage();
const upload = multer({storage: storage})

router.use('/:postId/comments', CommentRoutes);
router.route('/').get(getAll);
router.post('/', ProtectMiddleware, upload.array('posts', 5), addPost);
router
    .route('/:id')
    .get(getPost)
    .put(ProtectMiddleware, AuthMiddleware('user','admin'), updatePost)
    .delete(ProtectMiddleware, AuthMiddleware('user','admin'), deletePost);

router.route('/:id/likes').put(ProtectMiddleware,likePost);
router.route('/:id/unlike').put(ProtectMiddleware,unlikePost);

export default router;
