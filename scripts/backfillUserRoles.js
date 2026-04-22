import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import { ROLES } from "../constants/roles.js";

dotenv.config();

const run = async () => {
    await connectDB();

    const users = await User.find({});
    let updated = 0;

    for (const user of users) {
        if (!user.role) {
            user.role = user.isAdmin ? ROLES.ADMIN : ROLES.USER;
            // Keep old "isAdmin" values in sync with the new role field.
            await user.save();
            updated += 1;
        }
    }

    console.log(`Role backfill finished. Updated ${updated} users.`);
    await mongoose.connection.close();
};

run().catch(async (error) => {
    console.error("Backfill failed:", error.message);
    await mongoose.connection.close();
    process.exit(1);
});
