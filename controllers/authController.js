import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ROLES } from "../constants/roles.js";

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "30d" });

const isElevatedRole = (role) => role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;

const userPayload = (user, includeToken = false) => {
    const payload = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isAdmin: isElevatedRole(user.role),
        createdAt: user.createdAt,
    };
    if (includeToken) payload.token = generateToken(user._id);
    return payload;
};

// POST /api/auth/register
export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (await User.findOne({ email })) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }
        if (await User.findOne({ username })) {
            return res.status(400).json({ success: false, message: "Username is already taken" });
        }

        const user = await User.create({ username, email, password, role: ROLES.USER });

        return res.status(201).json({
            success: true,
            data: userPayload(user, true),
            message: "Account created successfully",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        return res.status(200).json({
            success: true,
            data: userPayload(user, true),
            message: "Logged in successfully",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/auth/profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({
            success: true,
            data: userPayload(user),
            message: "Profile fetched",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/auth/profile
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const { username, email, password } = req.body;

        if (email && email !== user.email) {
            const taken = await User.findOne({ email, _id: { $ne: user._id } });
            if (taken) {
                return res.status(400).json({ success: false, message: "Email already in use" });
            }
            user.email = email;
        }

        if (username && username !== user.username) {
            const taken = await User.findOne({ username, _id: { $ne: user._id } });
            if (taken) {
                return res.status(400).json({ success: false, message: "Username already in use" });
            }
            user.username = username;
        }

        if (password) user.password = password;

        const updated = await user.save();

        return res.status(200).json({
            success: true,
            data: userPayload(updated, true),
            message: "Profile updated successfully",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

