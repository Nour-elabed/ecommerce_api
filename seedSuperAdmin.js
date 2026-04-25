/**
 * SUPER_ADMIN Seeder Script
 * Run from Backend/ directory: node seedSuperAdmin.js
 *
 * Creates exactly one SUPER_ADMIN account and prevents duplicates
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";
import { ROLES } from "./constants/roles.js";

const seedSuperAdmin = async () => {
    try {
        await connectDB();
        
        // Check if SUPER_ADMIN already exists
        const existingSuperAdmin = await User.findOne({ role: ROLES.SUPER_ADMIN });
        
        if (existingSuperAdmin) {
            console.log('✅ SUPER_ADMIN already exists:', existingSuperAdmin.email);
            console.log('🔒 Skipping SUPER_ADMIN creation to prevent duplicates');
            process.exit(0);
        }
        
        // Create SUPER_ADMIN account
        const hashedPassword = await bcrypt.hash("admin123", 10);
        
        const superAdmin = new User({
            username: "SuperAdmin",
            email: "superadmin@ecommerce.com",
            password: hashedPassword,
            role: ROLES.SUPER_ADMIN,
        });
        
        await superAdmin.save();
        
        console.log('✅ SUPER_ADMIN account created successfully:');
        console.log('📧 Email: superadmin@ecommerce.com');
        console.log('🔑 Password: admin123');
        console.log('👤 Username: SuperAdmin');
        console.log('🎭 Role: SUPER_ADMIN');
        console.log('');
        console.log('⚠️  IMPORTANT: Change the password after first login!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding SUPER_ADMIN:', error);
        process.exit(1);
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedSuperAdmin();
}

export default seedSuperAdmin;
