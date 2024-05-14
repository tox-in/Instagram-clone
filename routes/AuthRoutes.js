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
