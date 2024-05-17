import User from "../models/User.js";
import asyncHandler from 'express-async-handler';
import {generateToken} from "../utils/generateToken.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import sendMail from '../utils/sendMail.js';
import cloudinary from "cloudinary";
import streamifier from "streamifier";

export const login = asyncHandler(async (req,res) => {
    const email = req.body.email;
    const user = await User.findOne({ email: email }).select('+password').populate('post');

    if(!user) {
        res.status(401);
        throw new Error('Email or password incorrect');
    }

    const matchPassword = bcrypt.compareSync(req.body.password, user.password);

    if (!matchPassword) {
        res.status(401);
        throw new Error('Incorrect credentials');
    }

    const token = generateToken(user.id);

    const data = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar:user.avatar,
        followers: user.followers,
        following: user.following,
        posts: user.posts,
        token,
    };

    res.status(201).json({ success: true, data});
});


export const register = asyncHandler(async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    const user  = await User.create({ name: name, email: email, password: password, role: role });

    res.status(201).json({ success: true, user});
});


export const uploadAvatar = asyncHandler(async (req, res) => {
    console.log(req.file);
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const avatar = req.file.path;

    try {
        let cld_upload_stream = cloudinary.v2.uploader.upload_stream(
            {
                folder: "avatar"
            },
            async function(error, result) {
                if (result.url){
                    const urlPhoto = result.url;
                    console.log(urlPhoto);
                    const user = await User.findByIdAndUpdate(
                        req.user.id,
                        { avatar: urlPhoto },
                        { new: true }
                    );
                    res.status(200).json({ success: true, data: user });
                }
                if (error) {
                    console.error('Error uploading avatar:', error);
                    res.status(500).json({ success: false, message: 'Failed to upload avatar' });
                }
            }
        );
        
        streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ success: false, message: 'Failed to upload avatar' });
    }
});


export const updateDetails = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user.id,
        {
            name,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(201).json({ success: true, data: user });
});

export const updatePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('+password');

    const {currentPassword, newPassword} = req.body;

    const matchPassword = bcrypt.compareSync(currentPassword, user.password);

    if(!matchPassword) {
        res.status(401);
        throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, data: user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const resetToken = crypto.randomBytes(20).toString('hex');
    const hash = crypto.createHash('sha256').update(resetToken).digest('hex');

    const email = req.body.email;

    console.log(req.body.email);

    const user = await User.findOne({ email });

    console.log(user);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    await User.findByIdAndUpdate( user.id, {
        resetPasswordToken: hash,
        resetPasswordExpire: new Date().setHours(new Date().getHours() + 2),
    }, console.log('success'));

    console.log(hash);

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${hash}`;

    const message = `
    you requested a password reset, <br />
    please click below to reset your password<br />
    <a href="${resetUrl}" target="_blank">Reset Password</a>
    `;

    try {
        sendMail(email, 'Forgot Password', message);
        console.log(message);

        res.status(201).json({ success: true, data: 'Check your email'});
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save({ validateBeforeSave: false});

        console.log('some errors');

        res.status(401);
        throw new Error(err.message);
    }
});


export const resetPassword = asyncHandler(async (req, res) => {
    const user = await  User.findOne({
        resetPasswordToken: req.params.resetToken,
        resetPasswordExpire: { $gt: Date.now()},
    });

    if(!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const { newPassword } = req.body;

    user.password = newPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({ success: true, data: user });
});



export const followUser = asyncHandler(async (req,res) => {
    const user = await User.findById(req.params.userId);
    const userToFollow = user;

    if(!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if(user.id === req.user.id) {
        res.status(404);
        throw new Error('Can\'t follow yourself');
    }

    if(user.followers.includes(req.user.id)) {
        res.status(404);
        throw new Error('You already follow this user');
    }

    const follow = await User.findByIdAndUpdate(
        user._id,
        {
            $push: { followers: req.user.id },
        },
        {
            new: true,
            runValidators: true,
        }
    );

    const updatedCurrentUser = await User.findByIdAndUpdate(
        req.user._id,
        { $push: { following: userToFollow._id } },
        { new: true, runValidators: true }
    );

    res.status(201).json({ success: true, data: 'successfully followed' });
});


export const unfollowUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.userId);
    const userToUnfollow= user;

	if (!user) {
		res.status(404);
		throw new Error('User not found');
	}

	const unfollow = await User.findByIdAndUpdate(
		user._id,
		{
			$pull: { followers: req.user.id },
		},
		{
			new: true,
			runValidators: true,
		}
	);

    const updateCurrentUser = await User.findByIdAndUpdate(
        req.user._id,
        { 
            $pull: { following: userToUnfollow.id },
        },
        {
            new: true,
            runValidators: true,
        }
    )



	res.status(201).json({ success: true, data: 'successfully unfollowed' });
});

export const getMe = asyncHandler(async (req, res) => {
    const user = req.user;

    res.status(201).json({ success: true, data: user });
});