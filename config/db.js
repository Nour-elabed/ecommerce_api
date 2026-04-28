import mongoose from "mongoose";

export const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is not set in environment variables.");
        process.exit(1);
    }
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};