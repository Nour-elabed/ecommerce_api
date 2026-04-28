/**
 * SUPER ADMIN SETUP - Clean Implementation
 * 
 * This script creates a proper super admin system with:
 * 1. Fixed environment loading
 * 2. Clean database operations
 * 3. Proper error handling
 * 4. Clear logging
 */

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables properly for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env') });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ROLES = {
    USER: "USER",
    ADMIN: "ADMIN", 
    SUPER_ADMIN: "SUPER_ADMIN"
};

console.log('🔍 Environment Configuration Check:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'CONFIGURED' : 'NOT CONFIGURED');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'CONFIGURED' : 'NOT CONFIGURED');

const setupSuperAdmin = async () => {
    try {
        // Step 1: Connect to database with proper error handling
        console.log('\n📗 Step 1: Connecting to database...');
        
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not found in environment variables');
        }
        
        console.log('📋 Connection string:', process.env.MONGO_URI.replace(/:([^:@]+)@/, ':***@'));
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Database connected successfully');
        
        // Step 2: Check existing users
        console.log('\n👥 Step 2: Checking existing users...');
        
        const User = mongoose.model('User', new mongoose.Schema({
            username: String,
            email: { type: String, unique: true },
            password: String,
            role: { type: String, enum: Object.values(ROLES), default: ROLES.USER }
        }, { timestamps: true }));
        
        const existingUsers = await User.find({}).select('email username role');
        
        if (existingUsers.length === 0) {
            console.log('📝 No users found. Creating super admin from scratch...');
            
            // Create super admin user
            const hashedPassword = await bcrypt.hash("admin123", 10);
            const superAdmin = new User({
                username: "SuperAdmin",
                email: "admin@watches-store.com",
                password: hashedPassword,
                role: ROLES.SUPER_ADMIN
            });
            
            await superAdmin.save();
            console.log('✅ Super Admin created successfully!');
            
        } else {
            console.log(`📋 Found ${existingUsers.length} existing users:`);
            existingUsers.forEach(user => {
                console.log(`   - ${user.email} (${user.username}) - Role: ${user.role}`);
            });
            
            // Check if super admin already exists
            const existingSuperAdmin = existingUsers.find(u => u.role === ROLES.SUPER_ADMIN);
            if (existingSuperAdmin) {
                console.log('✅ Super Admin already exists:', existingSuperAdmin.email);
            } else {
                console.log('📝 Promoting first user to Super Admin...');
                existingUsers[0].role = ROLES.SUPER_ADMIN;
                await existingUsers[0].save();
                console.log('✅ User promoted to Super Admin:', existingUsers[0].email);
            }
        }
        
        // Step 3: Display credentials
        console.log('\n🎯 SUPER ADMIN CREDENTIALS:');
        console.log('📧 Email: admin@watches-store.com');
        console.log('🔑 Password: admin123');
        console.log('👤 Username: SuperAdmin');
        console.log('🎭 Role: SUPER_ADMIN');
        console.log('\n🌐 Login at: http://localhost:5173/login');
        console.log('📋 Select "SUPER_ADMIN" from role dropdown');
        console.log('⚠️  Change password after first login!');
        
        await mongoose.disconnect();
        console.log('\n✅ Setup completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        
        if (error.message.includes('Authentication failed')) {
            console.log('💡 Fix: Update MongoDB credentials in .env');
            console.log('💡 Format: mongodb+srv://username:password@cluster...');
        }
        
        if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            console.log('💡 Fix: Check network connection and MongoDB Atlas cluster');
        }
        
        process.exit(1);
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    setupSuperAdmin();
}

export default setupSuperAdmin;
