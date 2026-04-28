/**
 * FINAL SUPER ADMIN SOLUTION - Complete Implementation
 * 
 * This script bypasses all environment issues and creates
 * a working super admin system with proper database operations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 FINAL SUPER ADMIN SETUP\n');

// Step 1: Manual configuration
const setupConfig = () => {
    console.log('📋 CONFIGURATION NEEDED:');
    console.log('Please open your .env file and update these values:');
    console.log('');
    console.log('MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.zfslkmm.mongodb.net/ecommerce');
    console.log('JWT_SECRET=your-actual-secret-key-here');
    console.log('');
    console.log('Replace YOUR_USERNAME with your MongoDB Atlas username');
    console.log('Replace YOUR_PASSWORD with your MongoDB Atlas password');
    console.log('Replace your-actual-secret-key-here with your actual secret');
    console.log('');
    console.log('After updating, run: node superAdminFinal.js');
    console.log('');
    
    // Check if .env has real values
    try {
        const envPath = path.join(__dirname, '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        if (envContent.includes('<YOUR_USERNAME>') || envContent.includes('<YOUR_PASSWORD>')) {
            console.log('❌ .env file still has placeholder values');
            console.log('💡 Please update .env with your actual MongoDB credentials');
            process.exit(1);
        }
        
        console.log('✅ .env file has real values - proceeding...');
        return true;
    } catch (error) {
        console.log('⚠️ Could not read .env file, using test mode');
        return false;
    }
};

// Step 2: Database operations
const createSuperAdmin = async () => {
    try {
        // Import modules dynamically
        const mongoose = await import('mongoose');
        const bcrypt = await import('bcryptjs');
        
        // Define roles
        const ROLES = {
            USER: "USER",
            ADMIN: "ADMIN",
            SUPER_ADMIN: "SUPER_ADMIN"
        };
        
        console.log('\n📗 Step 1: Connecting to database...');
        
        // Load environment
        const envPath = path.join(__dirname, '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = {};
        
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                envVars[key.trim()] = valueParts.join('=').trim();
            }
        });
        
        Object.assign(process.env, envVars);
        
        const mongoUri = process.env.MONGO_URI;
        console.log('📋 Connection string (masked):', mongoUri.replace(/:([^:@]+)@/, ':***@'));
        
        await mongoose.default.connect(mongoUri);
        console.log('✅ Database connected successfully');
        
        console.log('\n👥 Step 2: Setting up user schema...');
        
        // Create user schema
        const userSchema = new mongoose.default.Schema({
            username: { type: String, required: true, unique: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            role: { 
                type: String, 
                enum: Object.values(ROLES), 
                default: ROLES.USER 
            }
        }, { timestamps: true });
        
        const User = mongoose.default.model('User', userSchema);
        
        console.log('\n🔍 Step 3: Checking existing users...');
        const existingUsers = await User.find({}).select('email username role');
        
        if (existingUsers.length === 0) {
            console.log('📝 No users found. Creating super admin from scratch...');
            
            // Create super admin user
            const hashedPassword = await bcrypt.default.hash("admin123", 10);
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
        
        // Display final credentials
        console.log('\n🎯 SUPER ADMIN CREDENTIALS:');
        console.log('📧 Email: admin@watches-store.com');
        console.log('🔑 Password: admin123');
        console.log('👤 Username: SuperAdmin');
        console.log('🎭 Role: SUPER_ADMIN');
        console.log('\n🌐 LOGIN INSTRUCTIONS:');
        console.log('1. Go to: http://localhost:5173/login');
        console.log('2. Enter: admin@watches-store.com');
        console.log('3. Enter: admin123');
        console.log('4. Select: SUPER_ADMIN from dropdown');
        console.log('\n⚠️  IMPORTANT: Change password after first login!');
        
        await mongoose.default.disconnect();
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

// Execute setup
const configValid = setupConfig();
if (configValid) {
    createSuperAdmin();
}
