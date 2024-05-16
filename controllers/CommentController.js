import Comment from "../models/Comment.js";
import Post from '../models/Post.js';
import asyncHandler from 'express-async-handler';


export const getComments = asyncHandler(async (req, res) => {
    const comments = await Comment.find({});
    res.status(201).json({ success: true, data: comments });
});


export const addComment = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    req.body.user = req.user.id;
    req.body.post = post._id;

    const commentMessage = req.body.comment;

    console.log(commentMessage);

    try {
        const comment = await Comment.create(commentMessage)
        .populate("user");

      //return res.status(201).json({ success: true, data: comment });
      console.log(comment);
    } catch (error) {
      console.error("Error adding comment:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to add comment" });
    }
});

export const updateComment = asyncHandler(async (req, res) => {
    let comment = await Comment.findById(req.params.id);

    if(!comment) {
        res.status(404);
        throw new Error('Comment not found');
    }

    if(req.user.id !== comment.user.toString() && req.user.role !== 'admin') {
        res.status(404);
        throw new Error('Not Authorized to update this comment');
    }

    comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(201).json({ success: true, data: comment });
});



export const deleteComment = asyncHandler(async (req, res) => {
    let comment = await Comment.findById(req.params.id);

    if(!comment) {
        res.status(404);
        throw new Error('Comment not found');
    }
    if(req.user.id !== comment.user.toString() && req.user.role !== 'admin') {
        res.status(404);
        throw new Error('Not Authorized to delete this comment');
    }
        comment = await Comment.findByIdAndDelete(req.params.id);
        res.status(201).json({ success: true, data: {} });
});