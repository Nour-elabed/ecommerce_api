import mongoose from "mongoose";
export const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI); // to connect to the database using the connection string stored in the environment variable MONGO_URI
        console.log(`MongoDB Connected: ${conn.connection.host}`); // to log the message with the host name of the database that is connected to the console
    } catch(err){
        console.log(`Error: ${err.message}`);
        process.exit(1);// to exit the process with failure 1 means failure and 0 means success
    }
}