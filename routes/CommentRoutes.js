 import express from 'express';
 import { getComments, addComment, updateComment, deleteComment } from '../controllers/CommentController';
 import { ProtectMiddleware } from '../middleware/ProtectMiddleware';

 const router = express.Router({ mergeParams: true });

 router.route('/').get(getComments).post(ProtectMiddleware, addComment);
 router.route('/:id').delete(ProtectMiddleware, deleteComment);
 router.route('/:id').put(ProtectMiddleware, updateComment);