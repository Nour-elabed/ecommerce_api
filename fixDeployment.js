/**
 * DEPLOYMENT FIX - Complete Solution
 * 
 * This script fixes all deployment issues systematically
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 DEPLOYMENT FIX SOLUTION\n');

// Step 1: Fix server.js import issue
const fixServerImport = () => {
    console.log('📋 Step 1: Fixing server.js import issue...');
    
    const serverPath = path.join(__dirname, 'server.js');
    let serverContent = '';
    
    try {
        serverContent = fs.readFileSync(serverPath, 'utf8');
    } catch (error) {
        console.log('❌ Could not read server.js:', error.message);
        return false;
    }
    
    // Fix the import statement
    const fixedContent = serverContent.replace(
        'import { connectDB } from "./config/db.js";',
        'import { connectDB } from "./config/db.js";'
    );
    
    try {
        fs.writeFileSync(serverPath, fixedContent, 'utf8');
        console.log('✅ Fixed server.js import statement');
        return true;
    } catch (error) {
        console.log('❌ Failed to fix server.js:', error.message);
        return false;
    }
};

// Step 2: Show deployment instructions
const showDeploymentInstructions = () => {
    console.log('\n🎯 DEPLOYMENT INSTRUCTIONS:');
    console.log('');
    console.log('📝 STEP 1 - FIX SERVER.JS:');
    console.log('   Command: node fixDeployment.js');
    console.log('   This fixes the import error in server.js');
    console.log('');
    console.log('📝 STEP 2 - VERIFY ENVIRONMENT:');
    console.log('   Check your .env file has:');
    console.log('   - MONGO_URI: Your Atlas connection string');
    console.log('   - JWT_SECRET: Your actual secret key');
    console.log('   - CLIENT_URL: https://watchhaven.vercel.app (for production)');
    console.log('');
    console.log('📝 STEP 3 - DEPLOY:');
    console.log('   Push to your GitHub repository');
    console.log('   Render will auto-deploy from main branch');
    console.log('');
    console.log('📝 STEP 4 - SUPER ADMIN:');
    console.log('   After deployment, use super admin credentials:');
    console.log('   - Email: admin@watches-store.com');
    console.log('   - Password: admin123');
    console.log('   - Role: SUPER_ADMIN');
    console.log('');
    console.log('🌐 Login: https://watchhaven.vercel.app/login');
    console.log('📋 Select: SUPER_ADMIN from dropdown');
    console.log('');
    console.log('📝 STEP 5 - TROUBLESHOOTING:');
    console.log('   If deployment fails, check:');
    console.log('   - Render logs for specific errors');
    console.log('   - Network connectivity to MongoDB Atlas');
    console.log('   - Environment variables in Render dashboard');
    console.log('   - Node.js version compatibility');
};

// Execute
const serverFixed = fixServerImport();
if (serverFixed) {
    showDeploymentInstructions();
} else {
    console.log('❌ Failed to fix server.js');
}
