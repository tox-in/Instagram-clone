import asyncHandler from "express-async-handler";
import Post from "../models/Post.js";
import cloudinary from "cloudinary";
import streamifier from "streamifier";

export const getAll = asyncHandler(async (req, res) => {
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

export const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate("comments");

  if (!post) {
    res.status(404);
    throw new Error(" Post not found");
  }
  res.status(200).json({ success: true, data: post });
});

export const addPost = asyncHandler(async (req, res) => {
  req.body.user = req.user.id;

  let postBody = await Post.create(req.body);

  console.log(req.file);
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  try {
    let cld_upload_stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: "post",
      },
      async function (error, result) {
        if (result.url) {
          const urlPhoto = result.url;
          console.log(urlPhoto);
          const updatedPost = await Post.findByIdAndUpdate(
            postBody._id,
            { photo: urlPhoto },
            { new: true }
          );
          console.log(urlPhoto);
          res.status(200).json({ success: true, data: updatedPost });
        }
        if (error) {
          console.error("Error uploading post:", error);
          res
            .status(500)
            .json({ success: false, message: "Failed to upload post" });
        }
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to upload avatar" });
  }
});

export const updatePost = asyncHandler(async (req, res) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  if (
    req.user.id.toString() !== post.user.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(404);
    throw new Error("Not authorized to update this post");
  }

  post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({ success: true, data: post });
});

export const updatePostPhoto = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const currentPhotoURL = post.photo;

    if (currentPhotoURL) {
      const publicID = currentPhotoURL.split("/").pop().split(".")[0];
      await cloudinary.v2.uploader.destroy(publicID);
    }
    let cld_upload_stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: "post",
      },
      async function (error, result) {
        if (error) {
          console.error("Error uploading post photo:", error);
          return res
            .status(500)
            .json({ success: false, message: "Failed to upload post photo" });
        }

        post.photo = result.url;
        await post.save();

        res.status(200).json({ success: true, data: post });
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
  } catch (error) {
    console.error("Error updating post photo:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update post photo" });
  }
});

export const deletePost = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const currentPhotoURL = post.photo;

    if (currentPhotoURL) {
      const publicID = currentPhotoURL.split("/").pop().split(".")[0];
      await cloudinary.v2.uploader.destroy(publicID);
    }
    let deletedPost = await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error updating post photo:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update post photo" });
  }
});

export const likePost = asyncHandler(async (req, res) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  if (post.likes.includes(req.user.id)) {
    res.status(401);
    throw new Error("Already likes post");
  }

  post = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $push: { likes: req.user.id },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(201).json({ success: true, data: "liked successfully" });
});

export const unlikePost = asyncHandler(async (req, res) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post Not Found");
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

  res.status(201).json({ success: true, data: "unliked successfully" });
});
