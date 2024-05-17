 import express from 'express';
 import { getComments, addComment, updateComment, deleteComment } from '../controllers/CommentController.js';
 import { ProtectMiddleware } from '../middleware/ProtectMiddleware.js';

 const router = express.Router({ mergeParams: true });

 router.route('/:id').post(ProtectMiddleware, addComment);
 router.route('/:id').delete(ProtectMiddleware, deleteComment);
 router.route('/:id').get(getComments);
 router.route('/:id').put(ProtectMiddleware, updateComment);

 export default router;