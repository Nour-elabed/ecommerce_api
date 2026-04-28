/**
 * Test Database Connection
 * Run: node testConnection.js
 */
import dotenv from "dotenv";
dotenv.config();

console.log('🔍 Environment Check:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

if (process.env.MONGO_URI) {
    console.log('📋 Connection string:', process.env.MONGO_URI);
    console.log('✅ Ready to connect');
} else {
    console.log('❌ MONGO_URI not found in .env');
    console.log('💡 Please update your .env file with MongoDB Atlas credentials');
}
