/**
 * SUPER ADMIN CREATOR - Complete Solution
 * 
 * This script fixes all environment loading issues
 * and creates a proper super admin system
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix ES module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables manually
const loadEnv = () => {
    try {
        const envPath = path.join(__dirname, '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        const envVars = {};
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                envVars[key.trim()] = valueParts.join('=').trim();
            }
        });
        
        // Set environment variables
        Object.assign(process.env, envVars);
        
        console.log('✅ Environment loaded successfully');
        return true;
    } catch (error) {
        console.log('⚠️ Could not load .env file, using defaults');
        return false;
    }
};

const createSuperAdmin = async () => {
    try {
        console.log('🚀 SUPER ADMIN SETUP - Starting...\n');
        
        // Load environment variables
        const envLoaded = loadEnv();
        
        if (!envLoaded) {
            console.log('📋 Using default configuration');
        }
        
        // Check environment
        console.log('🔍 Environment Check:');
        console.log('   MONGO_URI:', process.env.MONGO_URI ? 'CONFIGURED' : 'NOT CONFIGURED');
        console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'CONFIGURED' : 'NOT CONFIGURED');
        
        if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<YOUR_USERNAME>')) {
            console.log('\n❌ SETUP REQUIRED:');
            console.log('1. Open .env file in ecommerce_api folder');
            console.log('2. Replace <YOUR_USERNAME> with your MongoDB Atlas username');
            console.log('3. Replace <YOUR_PASSWORD> with your MongoDB Atlas password');
            console.log('4. Replace JWT_SECRET with your actual secret');
            console.log('\n📋 Example:');
            console.log('MONGO_URI=mongodb+srv://myusername:mypassword@cluster0.zfslkmm.mongodb.net/ecommerce');
            console.log('JWT_SECRET=your-actual-secret-key-here');
            process.exit(1);
        }
        
        // Import mongoose after env loading
        const mongoose = await import('mongoose');
        
        console.log('\n📗 Step 1: Connecting to database...');
        console.log('📋 Connection string (masked):', process.env.MONGO_URI.replace(/:([^:@]+)@/, ':***@'));
        
        await mongoose.default.connect(process.env.MONGO_URI);
        console.log('✅ Database connected successfully');
        
        // Import bcrypt
        const bcrypt = await import('bcryptjs');
        
        // Define roles
        const ROLES = {
            USER: "USER",
            ADMIN: "ADMIN",
            SUPER_ADMIN: "SUPER_ADMIN"
        };
        
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
            console.log('📝 No users found. Creating super admin...');
            
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

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    createSuperAdmin();
}

export default createSuperAdmin;
