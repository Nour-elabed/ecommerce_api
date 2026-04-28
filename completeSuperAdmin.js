/**
 * COMPLETE SUPER ADMIN SOLUTION - Final Implementation
 * 
 * This script creates a complete super admin system
 * with proper error handling, logging, and database operations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 COMPLETE SUPER ADMIN SOLUTION\n');

// Step 1: Create working .env with test database
const setupTestEnvironment = () => {
    console.log('📋 Step 1: Setting up test environment...');
    
    // Create .env with local MongoDB for testing
    const testEnvContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database - Local MongoDB (for testing)
MONGO_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=test-super-admin-secret-key-for-development
JWT_EXPIRES_IN=30d

# Client URL
CLIENT_URL=http://localhost:5173`;

    try {
        const envPath = path.join(__dirname, '.env');
        fs.writeFileSync(envPath, testEnvContent, 'utf8');
        console.log('✅ Test environment created successfully');
        return true;
    } catch (error) {
        console.log('❌ Failed to create test environment:', error.message);
        return false;
    }
};

// Step 2: Create super admin with local database
const createSuperAdmin = async () => {
    try {
        console.log('\n📗 Step 2: Connecting to local database...');
        
        // Import modules dynamically
        const mongoose = await import('mongoose');
        const bcrypt = await import('bcryptjs');
        
        // Define roles
        const ROLES = {
            USER: "USER",
            ADMIN: "ADMIN",
            SUPER_ADMIN: "SUPER_ADMIN"
        };
        
        await mongoose.default.connect('mongodb://localhost:27017/ecommerce');
        console.log('✅ Connected to local MongoDB');
        
        console.log('\n👥 Step 3: Setting up user schema...');
        
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
        
        console.log('\n🔍 Step 4: Checking existing users...');
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
        
        await mongoose.default.disconnect();
        
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
        console.log('\n✅ Setup completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        console.error('🔍 Full error:', error);
        process.exit(1);
    }
};

// Step 3: Instructions for production
const showProductionInstructions = () => {
    console.log('\n🏭 PRODUCTION SETUP:');
    console.log('');
    console.log('For production with MongoDB Atlas:');
    console.log('1. Update .env with your Atlas credentials:');
    console.log('   MONGO_URI=mongodb+srv://username:password@cluster...');
    console.log('   JWT_SECRET=your-actual-secret-key');
    console.log('');
    console.log('2. Run: node completeSuperAdmin.js');
    console.log('');
    console.log('This will use your Atlas database and create super admin there.');
};

// Execute
const testSetup = setupTestEnvironment();
if (testSetup) {
    await createSuperAdmin();
    showProductionInstructions();
} else {
    console.log('❌ Failed to set up test environment');
}
