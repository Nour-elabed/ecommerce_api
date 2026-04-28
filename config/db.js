import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log(' Attempting to connect to MongoDB...');
        console.log(' MONGO_URI:', process.env.MONGO_URI ? 'CONFIGURED' : 'NOT CONFIGURED');
        
        if (!process.env.MONGO_URI) {
            console.log(' MONGO_URI not found in environment variables');
            console.log(' Please check your .env file');
            process.exit(1);
        }
        
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(` MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(' MongoDB Connection Error:', error.message);
        console.error(' Full error:', error);
        
        if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            console.log(' This looks like a network/dns issue');
            console.log(' Check your MongoDB Atlas connection string');
        }
        
        if (error.message.includes('Authentication failed')) {
            console.log(' Authentication failed - check username/password');
            console.log(' Verify your MongoDB Atlas credentials');
        }
        
        process.exit(1);
    }
};

export default connectDB;