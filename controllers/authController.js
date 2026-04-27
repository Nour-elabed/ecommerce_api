import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { ROLES } from "../constants/roles.js";

const generateToken = (id, role) =>
    jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "30d" });

const resolveRole = (userDoc) => {
    if (userDoc?.role) return userDoc.role;
    return ROLES.USER;
};

const isElevatedRole = (role) => role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
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

        const newUser = await User.create({ username, email, password, role: ROLES.USER });

        const role = resolveRole(newUser);
        const token = generateToken(newUser._id, role);
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
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
    const { email, password, role: requestedRole } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            res.status(401);
            throw new Error("Invalid email or password");
        }

        const role = resolveRole(user);
        if (requestedRole && requestedRole !== "AUTO" && requestedRole !== role) {
            res.status(403);
            throw new Error(`This account does not have ${requestedRole} access`);
        }
        const token = generateToken(user._id, role);

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
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            const role = resolveRole(user);
            res.status(200).json({
                success: true,
                data: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role,
                    isAdmin: isElevatedRole(role),
                    createdAt: user.createdAt,
                },
                message: "Profile fetched",
            });
        } else {
            res.status(404);
            throw new Error("User not found");
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();
            const role = resolveRole(updatedUser);
            const token = generateToken(updatedUser._id, role);

            res.status(200).json({
                success: true,
                data: {
                    id: updatedUser._id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    role,
                    isAdmin: isElevatedRole(role),
                    token,
                },
                message: "Profile updated successfully",
            });
        } else {
            res.status(404);
            throw new Error("User not found");
        }
    } catch (err) {
        next(err);
    }
};
