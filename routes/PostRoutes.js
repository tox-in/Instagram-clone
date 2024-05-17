import express from 'express';
import {
    getAll,
    getPost,
    addPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    updatePostPhoto
} from '../controllers/PostController.js';
import { ProtectMiddleware, AuthMiddleware } from '../middleware/ProtectMiddleware.js';
import CommentRoutes from './CommentRoutes.js';
import multer from 'multer';

const router = express.Router();

const storage =multer.memoryStorage();
const upload = multer({storage: storage})

router.use('/comments', CommentRoutes);
router.route('/').get(getAll);
router.post('/', ProtectMiddleware, upload.single("post"), addPost);
router
    .route('/:id')
    .get(getPost)
    .put(ProtectMiddleware, AuthMiddleware('user','admin'), updatePost)
router.delete('/:id', ProtectMiddleware, AuthMiddleware('user', 'admin'),deletePost);
router.put('/updateImg/:id', ProtectMiddleware, upload.single("post"), AuthMiddleware('user', 'admin'), updatePostPhoto);

router.route('/:id/like').put(ProtectMiddleware,likePost);
router.route('/:id/unlike').put(ProtectMiddleware,unlikePost);

export default router;
