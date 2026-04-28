/**
 * MONGODB ATLAS SUPER ADMIN SOLUTION
 * 
 * This script creates a complete super admin system
 * using MongoDB Atlas with proper error handling and logging
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌍 MONGODB ATLAS SUPER ADMIN SETUP\n');

// Step 1: Create Atlas environment
const setupAtlasEnvironment = () => {
    console.log('📋 Step 1: Setting up Atlas environment...');
    
    const atlasEnvContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database - MongoDB Atlas
MONGO_URI=mongodb+srv://<YOUR_USERNAME>:<YOUR_PASSWORD>@cluster0.zfslkmm.mongodb.net/ecommerce

# JWT
JWT_SECRET=your-secure-jwt-secret-change-this-in-production
JWT_EXPIRES_IN=30d

# Client URL
CLIENT_URL=http://localhost:5173`;

    try {
        const envPath = path.join(__dirname, '.env');
        fs.writeFileSync(envPath, atlasEnvContent, 'utf8');
        console.log('✅ Atlas environment template created');
        return true;
    } catch (error) {
        console.log('❌ Failed to create environment:', error.message);
        return false;
    }
};

// Step 2: Show instructions
const showInstructions = () => {
    console.log('\n🎯 ATLAS SETUP INSTRUCTIONS:');
    console.log('');
    console.log('1️⃣  UPDATE .env FILE:');
    console.log('   Open: ecommerce_api/.env');
    console.log('   Replace <YOUR_USERNAME> with your MongoDB Atlas username');
    console.log('   Replace <YOUR_PASSWORD> with your MongoDB Atlas password');
    console.log('   Replace JWT_SECRET with your actual secret key');
    console.log('');
    console.log('2️⃣  RUN SUPER ADMIN SETUP:');
    console.log('   Command: node atlasSuperAdmin.js');
    console.log('');
    console.log('3️⃣  LOGIN CREDENTIALS:');
    console.log('   Email: admin@watches-store.com');
    console.log('   Password: admin123');
    console.log('   Role: SUPER_ADMIN');
    console.log('');
    console.log('🌐 Login at: http://localhost:5173/login');
    console.log('📋 Select "SUPER_ADMIN" from dropdown');
    console.log('⚠️  Change password after first login!');
};

// Step 3: Create super admin with Atlas
const createSuperAdminWithAtlas = async () => {
    try {
        console.log('\n📗 Step 2: Connecting to MongoDB Atlas...');
        
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
        
        if (!mongoUri || mongoUri.includes('<YOUR_USERNAME>')) {
            console.log('\n❌ ATLAS CREDENTIALS NOT CONFIGURED');
            console.log('💡 Please update .env file with your Atlas credentials');
            console.log('📋 Format:');
            console.log('   MONGO_URI=mongodb+srv://username:password@cluster...');
            process.exit(1);
        }
        
        console.log('📋 Atlas connection (masked):', mongoUri.replace(/:([^:@]+)@/, ':***@'));
        
        // Import modules
        const mongoose = await import('mongoose');
        const bcrypt = await import('bcryptjs');
        
        // Define roles
        const ROLES = {
            USER: "USER",
            ADMIN: "ADMIN",
            SUPER_ADMIN: "SUPER_ADMIN"
        };
        
        await mongoose.default.connect(mongoUri);
        console.log('✅ Connected to MongoDB Atlas');
        
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
            console.log('✅ Super Admin created successfully in Atlas!');
            
        } else {
            console.log(`📋 Found ${existingUsers.length} existing users:`);
            existingUsers.forEach(user => {
                console.log(`   - ${user.email} (${user.username}) - Role: ${user.role}`);
            });
            
            // Check if super admin already exists
            const existingSuperAdmin = existingUsers.find(u => u.role === ROLES.SUPER_ADMIN);
            if (existingSuperAdmin) {
                console.log('✅ Super Admin already exists in Atlas:', existingSuperAdmin.email);
            } else {
                console.log('📝 Promoting first user to Super Admin...');
                existingUsers[0].role = ROLES.SUPER_ADMIN;
                await existingUsers[0].save();
                console.log('✅ User promoted to Super Admin in Atlas:', existingUsers[0].email);
            }
        }
        
        await mongoose.default.disconnect();
        
        // Display final credentials
        console.log('\n🎯 ATLAS SUPER ADMIN CREDENTIALS:');
        console.log('📧 Email: admin@watches-store.com');
        console.log('🔑 Password: admin123');
        console.log('👤 Username: SuperAdmin');
        console.log('🎭 Role: SUPER_ADMIN');
        console.log('🗄️ Database: MongoDB Atlas');
        console.log('\n🌐 LOGIN INSTRUCTIONS:');
        console.log('1. Go to: http://localhost:5173/login');
        console.log('2. Enter: admin@watches-store.com');
        console.log('3. Enter: admin123');
        console.log('4. Select: SUPER_ADMIN from dropdown');
        console.log('\n⚠️  IMPORTANT: Change password after first login!');
        console.log('\n✅ Atlas Super Admin setup completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Atlas setup failed:', error.message);
        
        if (error.message.includes('Authentication failed')) {
            console.log('💡 Fix: Check MongoDB Atlas credentials');
            console.log('💡 Verify username, password, and cluster access');
        }
        
        if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            console.log('💡 Fix: Check network connection');
            console.log('💡 Verify MongoDB Atlas cluster is accessible');
        }
        
        if (error.message.includes('ENOTFOUND')) {
            console.log('💡 Fix: Check MongoDB Atlas cluster name');
            console.log('💡 Verify cluster exists and is running');
        }
        
        process.exit(1);
    }
};

// Execute setup
const envSetup = setupAtlasEnvironment();
if (envSetup) {
    showInstructions();
    console.log('\n⚠️  UPDATE .env WITH YOUR ATLAS CREDENTIALS FIRST');
    console.log('Then run: node atlasSuperAdmin.js');
} else {
    console.log('❌ Environment setup failed');
}
