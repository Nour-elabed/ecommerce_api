import mongoose from "mongoose";

export const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is not set in environment variables.");
        process.exit(1);
    }
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`MongoDB connection error [${error.name}]: ${error.message}`);
        if (error.message.includes("ETIMEOUT") || error.message.includes("ENOTFOUND")) {
            console.error("Hint: DNS cannot resolve the Atlas SRV record. Try the non-SRV connection string, disable VPN, or switch network.");
        } else if (error.message.includes("Authentication failed")) {
            console.error("Hint: wrong user/password in MONGO_URI.");
        } else if (error.message.includes("IP that isn't whitelisted") || error.message.includes("Could not connect to any servers")) {
            console.error("Hint: your current IP is not in the Atlas Network Access allowlist.");
        }
        process.exit(1);
    }
};