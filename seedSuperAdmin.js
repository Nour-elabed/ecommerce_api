/**
 * SUPER_ADMIN seeder.
 *
 * Strategy:
 *   1. Try connecting to Atlas (12s budget).
 *   2. On success: create or promote a SUPER_ADMIN.
 *   3. On failure or with --print: hash the password locally and emit a
 *      ready-to-paste payload for the Atlas web UI (Data Explorer + mongosh).
 *
 * Usage:
 *   node seedSuperAdmin.js
 *   node seedSuperAdmin.js --email=user@example.com   (promote an existing user)
 *   node seedSuperAdmin.js --print                    (skip network, print payload)
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ROLES = { USER: "USER", ADMIN: "ADMIN", SUPER_ADMIN: "SUPER_ADMIN" };

const DEFAULT_EMAIL = process.env.SUPER_ADMIN_EMAIL || "superadmin@ecommerce.com";
const DEFAULT_USERNAME = process.env.SUPER_ADMIN_USERNAME || "SuperAdmin";
const DEFAULT_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "ChangeMe123!";

const CONNECT_BUDGET_MS = 12000;

const log = (msg) => process.stdout.write(msg + "\n");

const getFlag = (name) => {
    const arg = process.argv.find((a) => a.startsWith(`--${name}`));
    if (!arg) return null;
    if (!arg.includes("=")) return true;
    return arg.split("=")[1].trim();
};

const parseDatabaseName = (uri) => {
    try {
        const cleaned = uri.replace(/^mongodb(\+srv)?:\/\//, "");
        const afterAt = cleaned.includes("@") ? cleaned.split("@")[1] : cleaned;
        const afterHost = afterAt.split("/")[1] || "";
        const dbPart = afterHost.split("?")[0];
        return dbPart || "test";
    } catch {
        return "test";
    }
};

// ─── Inline schema ────────────────────────────────────────────────────────
// Self-contained: we don't import the project's User model so this script
// can never be broken by changes there.
const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
    },
    { timestamps: true }
);
const User = mongoose.models.User || mongoose.model("User", userSchema);

// ─── Offline fallback ─────────────────────────────────────────────────────
const printOfflinePayload = async (reason) => {
    if (reason) {
        log("");
        log("Could not reach MongoDB from this machine.");
        log(`Reason: ${reason}`);
        log("Falling back to OFFLINE PRINT mode (no network needed).");
    }

    const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const dbName = parseDatabaseName(process.env.MONGO_URI || "");
    const now = new Date().toISOString();

    const doc = {
        username: DEFAULT_USERNAME,
        email: DEFAULT_EMAIL,
        password: hashed,
        role: ROLES.SUPER_ADMIN,
        createdAt: { $date: now },
        updatedAt: { $date: now },
    };

    log("");
    log("=========================================================");
    log("  SUPER_ADMIN OFFLINE PAYLOAD");
    log("=========================================================");
    log(`  Database  : ${dbName}`);
    log(`  Collection: users`);
    log(`  Login email   : ${DEFAULT_EMAIL}`);
    log(`  Login password: ${DEFAULT_PASSWORD}`);
    log("");
    log("  OPTION A — Atlas Data Explorer (web UI):");
    log("  1. Atlas → Browse Collections → " + dbName + ".users → INSERT DOCUMENT");
    log("  2. Switch to {} JSON view");
    log("  3. Paste this document and click Insert:");
    log("");
    log(JSON.stringify(doc, null, 2));
    log("");
    log("  OPTION B — Atlas web shell (mongosh in browser):");
    log("  1. Atlas → cluster → … menu → Open MongoDB Shell");
    log("  2. Paste:");
    log("");
    log(`use ${dbName}`);
    log(
        `db.users.insertOne(${JSON.stringify({
            username: DEFAULT_USERNAME,
            email: DEFAULT_EMAIL,
            password: hashed,
            role: ROLES.SUPER_ADMIN,
            createdAt: new Date(now),
            updatedAt: new Date(now),
        }).replace(/"createdAt":"([^"]+)"/, '"createdAt":new Date("$1")').replace(/"updatedAt":"([^"]+)"/, '"updatedAt":new Date("$1")')})`
    );
    log("");
    log("  After inserting, log in at /login with the credentials above.");
    log("  Change the password from your profile after first login.");
    log("=========================================================");
};

// ─── Online path ──────────────────────────────────────────────────────────
const connectWithBudget = () =>
    Promise.race([
        mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: CONNECT_BUDGET_MS,
            connectTimeoutMS: CONNECT_BUDGET_MS,
            socketTimeoutMS: CONNECT_BUDGET_MS,
        }),
        new Promise((_, reject) =>
            setTimeout(
                () => reject(new Error(`hard timeout: no response from MongoDB in ${CONNECT_BUDGET_MS / 1000}s`)),
                CONNECT_BUDGET_MS + 1000
            )
        ),
    ]);

const runOnline = async () => {
    log("Connecting to MongoDB...");
    await connectWithBudget();
    log(`Connected to: ${mongoose.connection.db.databaseName}`);

    const targetEmail = getFlag("email");

    if (typeof targetEmail === "string" && targetEmail.length > 0) {
        log(`Promoting user: ${targetEmail}`);
        const user = await User.findOne({ email: targetEmail.toLowerCase() });
        if (!user) {
            log(`No user found with email ${targetEmail}`);
            await mongoose.disconnect();
            process.exit(1);
        }
        await User.updateOne({ _id: user._id }, { $set: { role: ROLES.SUPER_ADMIN } });
        log(`SUCCESS: ${targetEmail} is now SUPER_ADMIN`);
        await mongoose.disconnect();
        return;
    }

    const existing = await User.findOne({ role: ROLES.SUPER_ADMIN });
    if (existing) {
        log(`SUPER_ADMIN already exists: ${existing.email}`);
        await mongoose.disconnect();
        return;
    }

    const emailTaken = await User.findOne({ email: DEFAULT_EMAIL });
    if (emailTaken) {
        log(`Email ${DEFAULT_EMAIL} is already used by a non-super-admin user.`);
        log(`Re-run with --email=${DEFAULT_EMAIL} to promote that user.`);
        await mongoose.disconnect();
        process.exit(1);
    }

    const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    await User.create({
        username: DEFAULT_USERNAME,
        email: DEFAULT_EMAIL,
        password: hashed,
        role: ROLES.SUPER_ADMIN,
    });

    log("");
    log("=========================================================");
    log("  SUPER_ADMIN CREATED");
    log("=========================================================");
    log(`  Email   : ${DEFAULT_EMAIL}`);
    log(`  Password: ${DEFAULT_PASSWORD}`);
    log("  Change this password after the first login.");
    log("=========================================================");
    await mongoose.disconnect();
};

// ─── Entry ────────────────────────────────────────────────────────────────
const main = async () => {
    log("SEED START");

    if (!process.env.MONGO_URI) {
        log("MONGO_URI is not set in .env");
        process.exit(1);
    }

    if (getFlag("print")) {
        await printOfflinePayload(null);
        return;
    }

    try {
        await runOnline();
    } catch (error) {
        try {
            await mongoose.disconnect();
        } catch {}
        await printOfflinePayload(error.message || String(error));
    }
};

process.on("unhandledRejection", (e) => {
    log("UNHANDLED: " + (e && e.message ? e.message : String(e)));
    process.exit(1);
});

main()
    .then(() => process.exit(0))
    .catch((e) => {
        log("FATAL: " + (e && e.message ? e.message : String(e)));
        process.exit(1);
    });
