import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Your Database is connected a successfully");
    } catch (err) {
        console.log(err.message);
    }
}

export default connectDB;