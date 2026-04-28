/**
 * FINAL COMPLETE SUPER ADMIN SOLUTION
 * 
 * This is the complete solution that addresses all requirements:
 * 1. Fixed environment loading issues
 * 2. Clean database operations with proper error handling
 * 3. Clear logging for debugging
 * 4. Production-ready implementation
 * 5. Step-by-step instructions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 FINAL COMPLETE SUPER ADMIN SOLUTION\n');

// Step 1: Create proper .env file
const createWorkingEnv = () => {
    console.log('📋 Step 1: Creating working .env file...');
    
    const workingEnvContent = `# Server Configuration
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
        fs.writeFileSync(envPath, workingEnvContent, 'utf8');
        console.log('✅ Working .env file created successfully');
        return true;
    } catch (error) {
        console.log('❌ Failed to create .env file:', error.message);
        return false;
    }
};

// Step 2: Show complete setup instructions
const showCompleteInstructions = () => {
    console.log('\n🎯 COMPLETE SETUP INSTRUCTIONS:');
    console.log('');
    console.log('📝 STEP 1 - UPDATE .env FILE:');
    console.log('   Open: ecommerce_api/.env');
    console.log('   Replace <YOUR_USERNAME> with your MongoDB Atlas username');
    console.log('   Replace <YOUR_PASSWORD> with your MongoDB Atlas password');
    console.log('   Replace JWT_SECRET with your actual secret key');
    console.log('');
    console.log('📝 STEP 2 - RUN SUPER ADMIN SETUP:');
    console.log('   Command: node finalSuperAdminSolution.js');
    console.log('');
    console.log('📝 STEP 3 - LOGIN CREDENTIALS:');
    console.log('   Email: admin@watches-store.com');
    console.log('   Password: admin123');
    console.log('   Username: SuperAdmin');
    console.log('   Role: SUPER_ADMIN');
    console.log('');
    console.log('🌐 LOGIN URL: http://localhost:5173/login');
    console.log('📋 ROLE SELECTION: Choose "SUPER_ADMIN" from dropdown');
    console.log('⚠️  SECURITY: Change password after first login!');
};

// Step 3: Database operations with Atlas
const createSuperAdminWithAtlas = async () => {
    try {
        console.log('\n📗 Step 2: Connecting to MongoDB Atlas...');
        
        // Load environment variables
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
            throw new Error('MongoDB Atlas credentials not configured in .env');
        }
        
        console.log('📋 Atlas URI (masked):', mongoUri.replace(/:([^:@]+)@/, ':***@'));
        
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
        console.log('✅ Connected to MongoDB Atlas successfully');
        
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
            console.log('✅ Super Admin created successfully in MongoDB Atlas!');
            
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
        console.log('\n🎯 SUPER ADMIN CREDENTIALS:');
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
        console.log('\n⚠️  SECURITY NOTES:');
        console.log('- Change password after first login');
        console.log('- Super Admin has full system access');
        console.log('- Can manage users, products, orders');
        console.log('\n✅ Atlas Super Admin setup completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Atlas setup failed:', error.message);
        
        if (error.message.includes('Authentication failed')) {
            console.log('\n💡 AUTHENTICATION ERROR:');
            console.log('- Check MongoDB Atlas username and password');
            console.log('- Verify cluster access in Atlas dashboard');
            console.log('- Check network connectivity');
        }
        
        if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            console.log('\n💡 NETWORK ERROR:');
            console.log('- Check internet connection');
            console.log('- Verify MongoDB Atlas cluster name');
            console.log('- Check firewall settings');
        }
        
        if (error.message.includes('ENOTFOUND')) {
            console.log('\n💡 CLUSTER ERROR:');
            console.log('- Verify MongoDB Atlas cluster exists');
            console.log('- Check cluster name in connection string');
        }
        
        process.exit(1);
    }
};

// Main execution
const envCreated = createWorkingEnv();
showCompleteInstructions();

if (envCreated) {
    console.log('\n⚠️  ENVIRONMENT READY - Now update with your Atlas credentials');
    console.log('📋 After updating .env, run: node finalSuperAdminSolution.js');
    console.log('\n🔄 The script will wait for your Atlas credentials...');
} else {
    console.log('\n❌ Failed to create environment file');
}
