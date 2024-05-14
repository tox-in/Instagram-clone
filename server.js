import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fileUpload from 'express-fileupload';
import connectDB from './config/db.js';

//ROUTES
import UserRoutes from './routes/UserRoutes.js'

const app = express();

dotenv.config();

connectDB();

app.use(cors());

app.get('/', (req, res) => {
    res.status(201).json({success:true, message:'Welcome to instagram-clone api '}) 
});

app.use('/api/v1/users', UserRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server is running at http://localhost/${PORT}`));