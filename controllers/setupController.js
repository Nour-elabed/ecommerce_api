import jwt from "jsonwebtoken";
import { timingSafeEqual } from "crypto";
import User from "../models/User.js";
import { ROLES } from "../constants/roles.js";

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "30d",
    });

const safeEqual = (a, b) => {
    const ba = Buffer.from(a || "", "utf8");
    const bb = Buffer.from(b || "", "utf8");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
};

const ipOf = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown";

const log = (req, status, detail) => {
    console.log(
        "[setup] attempt from",
        ipOf(req),
        "at",
        new Date().toISOString(),
        "- result:",
        `${status}${detail ? ` (${detail})` : ""}`
    );
};

// POST /api/setup/superadmin
export const setupSuperAdmin = async (req, res) => {
    try {
        if (!process.env.SETUP_SECRET) {
            log(req, "FAIL", "SETUP_SECRET not configured");
            return res.status(503).json({
                success: false,
                message: "Setup is not configured on this server.",
            });
        }

        const { setupSecret, username, email, password } = req.body || {};

        if (!safeEqual(setupSecret, process.env.SETUP_SECRET)) {
            log(req, "FAIL", "invalid secret");
            return res.status(401).json({
                success: false,
                message: "Invalid setup secret.",
            });
        }

        try {
            const existingSuper = await User.findOne({ role: ROLES.SUPER_ADMIN });
            if (existingSuper) {
                log(req, "FAIL", "already exists");
                return res.status(403).json({
                    success: false,
                    message: "Setup already complete. A SUPER_ADMIN already exists.",
                });
            }
        } catch (e) {
            console.error("[setupController]", e.message);
            return res.status(500).json({ success: false, message: "Database error." });
        }

        if (!username || typeof username !== "string" || username.trim().length < 3) {
            log(req, "FAIL", "bad username");
            return res.status(400).json({
                success: false,
                message: "Username is required (min 3 characters).",
            });
        }
        if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
            log(req, "FAIL", "bad email");
            return res.status(400).json({
                success: false,
                message: "A valid email is required.",
            });
        }
        if (!password || typeof password !== "string" || password.length < 8) {
            log(req, "FAIL", "weak password");
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters.",
            });
        }

        try {
            if (await User.findOne({ email: email.toLowerCase() })) {
                log(req, "FAIL", "email taken");
                return res.status(400).json({
                    success: false,
                    message: "Email is already registered.",
                });
            }
            if (await User.findOne({ username })) {
                log(req, "FAIL", "username taken");
                return res.status(400).json({
                    success: false,
                    message: "Username is already taken.",
                });
            }
        } catch (e) {
            console.error("[setupController]", e.message);
            return res.status(500).json({ success: false, message: "Database error." });
        }

        try {
            const user = new User({
                username: username.trim(),
                email: email.toLowerCase().trim(),
                password,
                role: ROLES.SUPER_ADMIN,
            });
            user.__skipRoleGuard = true;
            await user.save();

            const token = generateToken(user._id);

            log(req, "SUCCESS", `created ${user.email}`);
            return res.status(201).json({
                success: true,
                message:
                    "SUPER_ADMIN created successfully. This endpoint is now permanently disabled.",
                data: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    token,
                },
            });
        } catch (e) {
            console.error("[setupController]", e.message);
            return res.status(500).json({
                success: false,
                message: "Failed to create SUPER_ADMIN.",
            });
        }
    } catch (e) {
        console.error("[setupController]", e.message);
        return res.status(500).json({ success: false, message: "Unexpected error." });
    }
};
