import express from "express";
import Joi from "joi";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { admin } from "../middleware/admin.js";
import validate from "../middleware/validate.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

// ─── Validation Schemas ───────────────────────────────────────────
const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string()
        .valid(ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN),
});

const resolveRole = (userDoc) => {
    if (userDoc?.role) return userDoc.role;
    // Backward compatibility for accounts created before role migration.
    if (userDoc?.isAdmin === true) return ROLES.ADMIN;
    return ROLES.USER;
};

const isElevatedRole = (role) => role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;

// ─── Register ─────────────────────────────────────────────────────
router.post("/register", validate(registerSchema), async (req, res, next) => {
    const { username, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error("User with this email already exists");
        }
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            res.status(400);
            throw new Error("Username is already taken");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({ username, email, password: hashedPassword, role: ROLES.USER });

        const token = generateToken(newUser._id);
        const role = resolveRole(newUser);
        res.status(201).json({
            success: true,
            data: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role,
                isAdmin: isElevatedRole(role),
                token,
            },
            message: "Account created successfully",
        });
    } catch (err) {
        next(err);
    }
});

// ─── Login ────────────────────────────────────────────────────────
router.post("/login", validate(loginSchema), async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(401);
            throw new Error("Invalid email or password");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user._id);
        const role = resolveRole(user);

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role,
                isAdmin: isElevatedRole(role),
                token,
            },
            message: "Logged in successfully",
        });
    } catch (err) {
        next(err);
    }
});

// ─── Profile ──────────────────────────────────────────────────────
router.get("/profile", protect, async (req, res, next) => {
    try {
        const role = resolveRole(req.user);
        res.status(200).json({
            success: true,
            data: {
                ...req.user.toObject(),
                role,
                isAdmin: isElevatedRole(role),
            },
            message: "Profile fetched",
        });
    } catch (err) {
        next(err);
    }
});

// ─── Admin: Get All Users ─────────────────────────────────────────
router.get("/", protect, admin, async (req, res, next) => {
    try {
        const users = await User.find({}).select("-password");
        res.status(200).json({
            success: true,
            data: users,
            message: "Users fetched successfully",
        });
    } catch (err) {
        next(err);
    }
});

// ─── Admin: Delete User ──────────────────────────────────────────
router.delete("/:id", protect, admin, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }
        const role = resolveRole(user);
        if (role === ROLES.ADMIN) {
            res.status(400);
            throw new Error("Cannot delete an admin user");
        }
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: "User removed",
        });
    } catch (err) {
        next(err);
    }
});

// ─── Helper ───────────────────────────────────────────────────────
const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "30d" });

export default router;