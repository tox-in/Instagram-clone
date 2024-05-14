import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import users from './data/users.js';

dotenv.config();

connectDB();

const insertData = async () => {
    try {
        await User.create(users);

        console.log('Data inserted successfully');
    } catch (err) {
        console.log(err.message);
    }
}

const deleteData = async () => {
	try {
		await User.deleteMany();
		console.log('Data deleted successfully');
	} catch (error) {
		console.log(error.message);
	}
};

if (process.argv[2] === '-i') {
	insertData();
} else {
	deleteData();
}