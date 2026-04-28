/**
 * SUPER_ADMIN seeder.
 *
 * Usage:
 *   node seedSuperAdmin.js
 *     -> Creates a SUPER_ADMIN with default credentials if none exists.
 *
 *   node seedSuperAdmin.js --email=someone@example.com
 *     -> Promotes that existing user to SUPER_ADMIN.
 *
 * Default credentials can be overridden via env vars
 * SUPER_ADMIN_EMAIL, SUPER_ADMIN_USERNAME, SUPER_ADMIN_PASSWORD.
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import { ROLES } from "./constants/roles.js";

const DEFAULT_EMAIL = process.env.SUPER_ADMIN_EMAIL || "superadmin@example.com";
const DEFAULT_USERNAME = process.env.SUPER_ADMIN_USERNAME || "SuperAdmin";
const DEFAULT_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "ChangeMeNow!123";

const parseEmailFlag = () => {
    const arg = process.argv.find((a) => a.startsWith("--email="));
    return arg ? arg.split("=")[1].trim().toLowerCase() : null;
};

const exit = async (code) => {
    await mongoose.disconnect().catch(() => {});
    process.exit(code);
};

const promoteByEmail = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        console.error(`No user found with email ${email}`);
        return exit(1);
    }
    if (user.role === ROLES.SUPER_ADMIN) {
        console.log(`User ${email} is already SUPER_ADMIN.`);
        return exit(0);
    }
    const otherSuper = await User.findOne({ role: ROLES.SUPER_ADMIN });
    if (otherSuper) {
        console.error(`A different SUPER_ADMIN already exists: ${otherSuper.email}`);
        return exit(1);
    }
    user.role = ROLES.SUPER_ADMIN;
    user.__skipRoleGuard = true;
    await user.save();
    console.log(`Promoted ${email} to SUPER_ADMIN.`);
    return exit(0);
};

const createDefault = async () => {
    const existing = await User.findOne({ role: ROLES.SUPER_ADMIN });
    if (existing) {
        console.log(`SUPER_ADMIN already exists: ${existing.email}`);
        return exit(0);
    }

    const emailTaken = await User.findOne({ email: DEFAULT_EMAIL });
    if (emailTaken) {
        console.error(`Cannot create default SUPER_ADMIN: email ${DEFAULT_EMAIL} is already taken by another user.`);
        console.error("Re-run with --email to promote that user instead.");
        return exit(1);
    }

    const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    // insertOne bypasses pre-save hooks (no double-hash, no role guard).
    await User.collection.insertOne({
        username: DEFAULT_USERNAME,
        email: DEFAULT_EMAIL,
        password: hashed,
        role: ROLES.SUPER_ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    console.log("SUPER_ADMIN created.");
    console.log(`  email:    ${DEFAULT_EMAIL}`);
    console.log(`  username: ${DEFAULT_USERNAME}`);
    console.log(`  password: ${DEFAULT_PASSWORD}`);
    console.log("Change this password after the first login.");
    return exit(0);
};

const run = async () => {
    try {
        await connectDB();
        const email = parseEmailFlag();
        if (email) {
            await promoteByEmail(email);
        } else {
            await createDefault();
        }
    } catch (error) {
        console.error("Seeder failed:", error.message);
        await exit(1);
    }
};

run();
