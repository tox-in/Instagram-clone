import express from 'express';
import {
    login,
    register,
    uploadAvatar,
    getMe,
    updateDetails,
    updatePassword,
    forgotPassword,
    resetPassword,
    followUser,
    unfollowUser
} from '../controllers/AuthController.js';
import multer from 'multer';
import { ProtectMiddleware } from '../middleware/ProtectMiddleware.js';

const storage =multer.memoryStorage();
const upload = multer({storage: storage})

const router = express.Router();

router.route('/login').post(login);
router.route('/register').post(register);
router.put('/avatar', ProtectMiddleware, upload.single("avatar"), uploadAvatar);
router.route('/me').get(ProtectMiddleware, getMe);
router.route('/updateDetails').put(ProtectMiddleware, updateDetails);
router.route('/updatePassword').put(ProtectMiddleware, updatePassword);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:resetToken').put(resetPassword);

router.route('/follow/:userId').put(ProtectMiddleware, followUser);
router.route('/unfollow/:userId').put(ProtectMiddleware,unfollowUser);

export default router;