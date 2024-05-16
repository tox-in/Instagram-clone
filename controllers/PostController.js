import asyncHandler from 'express-async-handler';
import Post from '../models/Post.js';
import cloudinary from "cloudinary";
import streamifier from "streamifier";

export const getAll = asyncHandler(async (req,res) => {
    const posts = await Post.find({})
      .populate("user")
      .populate("comments")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          model: "User",
        },
      });
    res.status(201).json({ success: true, count: posts.length, data: posts });
});


export const getPost = asyncHandler(async (req,res) => {
    const post = await Post.findById(req.params.id)
    .populate("comments");

    if(!post) {
        res.status(404);
        throw new Error(' Post not found');
    }
    res.status(200).json({ success: true, data: post });
});


export const addPost = asyncHandler(async (req, res) => {

    req.body.user = req.user.id;

    let postBody = await Post.create(req.body);

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    if (req.files.length > 5) {
        return res.status(400).json({ success: false, message: 'Maximum 5 images allowed' });
    }
    const uploadedImageURLs = [];

    try {
        for (const file of req.files) {
            const result = await cloudinary.v2.uploader.upload(file.tempFilePath, { folder: "posts" });
            uploadedImageURLs.push(result.url);
        }

        const updatedPost = await Post.findByIdAndUpdate(
            postBody._id,
            { $push: { images: { $each: uploadedImageURLs } } },
            { new: true }
        );

        res.status(200).json({ success: true, data: updatedPost });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({ success: false, message: 'Failed to upload images' });
    }
});



export const updatePost = asyncHandler(async (req, res) => {
    let post = await Post.findById(req.params.id);

    if(!post) {
        res.status(404);
        throw new Error('Post not found');
    }

    if(req.user.id.toString() !== post.user.toString() && req.user.role !== 'admin') {
        res.status(404);
        throw new Error('Not authorized to update this post');
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(201).json({ success: true, data: post });
});


export const deletePost = asyncHandler( async(req, res) => {
    let post = await Post.findById(req.params.id);

    if(!post) {
        res.status(404);
        throw new Error('Post Not Found');
    }

    if(req.user.id.toString() !== post.user.toString() && req.user.role !== 'admin') {
        res.status(404);
        throw new Error('Not Authorized to delete this post');
    }

    post = await Post.findByIdAndDelete(req.params.id);

    res.status(201).json({ success: true, data: {} });
});


export const likePost = asyncHandler( async (req,res) => {
    let post = await Post.findById(req.params.id);

    if(!post) {
        res.status(404);
        throw new Error('Post not found');
    }

    if(post.likes.includes(req.user.id)){
        res.status(401);
        throw new Error('Already likes post');
    }

    post = await Post.findByIdAndUpdate(
        req.params.id,
        {
            $push: { likes: req.user.id }
        },
        {
            new: true,
            runValidators: true
        }
    );
    res.status(201).json({ success: true, data: post });
});


export const unlikePost = asyncHandler(async (req, res) => {
	let post = await Post.findById(req.params.id);

	if (!post) {
		res.status(404);
		throw new Error('Post Not Found');
	}

	post = await Post.findByIdAndUpdate(
		req.params.id,
		{
			$pull: { likes: req.user.id },
		},
		{
			new: true,
			runValidators: true,
		}
	);

	res.status(201).json({ success: true, data: post });
});