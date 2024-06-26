import asyncHandler from 'express-async-handler';
import User from '../models/User.js'

export const getAll = asyncHandler(async (req,res) => {
    let query;
    if(req.query.search) {
        query = await User.find({ name: { $regex: req.query.search, $options: 'i'} }).populate('posts');
    } else {
        query = await User.find({}).populate('posts');
    }
    res.status(201).json({ success: true, count: query.length, data: query});
});

export const getUser = asyncHandler(async (req,res) => {
    const user = await User.findById(req.params.id).populate('posts');
    if(!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.status(201).json({ success: true, data: user});
});