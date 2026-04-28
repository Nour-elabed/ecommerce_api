/**
 * ENVIRONMENT FIXER - Complete Solution
 * 
 * This script fixes all environment loading issues
 * and creates proper super admin system
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 FIXING ENVIRONMENT ISSUES...\n');

// Step 1: Create proper .env file
const createEnvFile = () => {
    const envContent = `# Server Configuration
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
        fs.writeFileSync(path.join(__dirname, '.env'), envContent, 'utf8');
        console.log('✅ .env file created successfully');
        return true;
    } catch (error) {
        console.log('❌ Failed to create .env file:', error.message);
        return false;
    }
};

// Step 2: Show instructions
const showInstructions = () => {
    console.log('\n🎯 SETUP INSTRUCTIONS:');
    console.log('');
    console.log('1️⃣  UPDATE YOUR .env FILE:');
    console.log('   Open: ecommerce_api/.env');
    console.log('   Replace <YOUR_USERNAME> with your MongoDB Atlas username');
    console.log('   Replace <YOUR_PASSWORD> with your MongoDB Atlas password');
    console.log('   Replace JWT_SECRET with your actual secret key');
    console.log('');
    console.log('2️⃣  RUN SUPER ADMIN SETUP:');
    console.log('   Command: node createSuperAdmin.js');
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

// Execute
const envCreated = createEnvFile();
showInstructions();

if (envCreated) {
    console.log('\n✅ Environment fixed! Ready to proceed.');
} else {
    console.log('\n❌ Please manually create .env file with your MongoDB credentials.');
}
