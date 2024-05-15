import asyncHandler from 'express-async-handler';
import Post from '../models/Post';

export const getAll = asyncHandler(async (req,res) => {
    const posts = await Post.find({})
            .populate('user')
            .populate('comments')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    model: 'user'
                },
            });
    res.status(201).json({ success: true, count: posts.length, data: posts });
});


export const getPost = asyncHandler(async (req,res) => {
    const post = await Post.findById(req.params.id);

    if(!post) {
        res.status(404);
        throw new Error(' Post not found');
    }
    res.status(200).json({ success: true, data: post });
});


export const addPost = asyncHandler(async (req, res) => {
    req.body.user = req.user.id;
    let post = await Post.create(req.body);

    if(req.files) {
        if(!req.files.mimetype.startsWith('image')) {
           res.status(401);
           throw new Error('Please add image file'); 
        }

        if(req.files.photo.size > process.env.FILE_UPLOAD_LIMIT) {
            res.status(401);
            throw new Error(`Please add a phto less than ${process.env.FILE_UPLOAD_LIMIT}`);
        }

        const photoFile = req.files.photo;

        photoFile.mv(`${process.env.FILE_UPLOAD_PATH}/${photoFile.name}`, async (err) => {
            if (err) {
                res.status(401);
                throw new Error(err.message);
            }

            post = await Post.findByIdAndUpdate(
                post._id,
                { photo: photoFile.name },
                {
                    new: true,
                    runValidators: true,
                }
            );
            res.status(201).json({ success: true, data: post });
        });
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