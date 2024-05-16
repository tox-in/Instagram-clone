import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fileUpload from 'express-fileupload';
import connectDB from './config/db.js';
import bodyParser from 'body-parser';

import { notFound, errorHandler } from './middleware/ErrorMiddleware.js';


import UserRoutes from './routes/UserRoutes.js';
import AuthRoutes from './routes/AuthRoutes.js';
import CommentRoutes from './routes/CommentRoutes.js';
import PostRoutes from './routes/PostRoutes.js';

const app = express();

dotenv.config();

connectDB();

app.use(cors());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(201).json({success:true, message:'Welcome to instagram-clone api '}) 
});

app.use('/api/v1/users', UserRoutes);

app.use('/api/v1/auth', AuthRoutes);

app.use('/api/v1/comments', CommentRoutes);

app.use('/api/v1/posts', PostRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server is running at http://localhost/${PORT}`));