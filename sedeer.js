import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';
import users from './data/users.js';
import comments from './data/comments.js';
import posts from './data/posts.js';

dotenv.config();

connectDB();

const insertData = async () => {
    try {
        await User.create(users);
		await Post.create(posts);
		await Comment.create(comments);
        console.log('Data inserted successfully int the db');
    } catch (err) {
        console.log(err.message);
    }
}

const deleteData = async () => {
	try {
		await User.deleteMany();
		await Post.deleteMany();
		await Comment.deleteMany();
		console.log('Data deleted successfully');
	} catch (error) {
		console.log(error.message);
	}
};

if (process.argv[2] === '-in') {
	insertData();
} else {
	deleteData();
}