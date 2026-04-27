import express from "express";
import Joi from "joi";
import { protect } from "../middleware/auth.js";
import { admin } from "../middleware/admin.js";
import validate from "../middleware/validate.js";
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
} from "../controllers/authController.js";
import User from "../models/User.js";
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
    role: Joi.string().valid("AUTO", ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN).default("AUTO"),
});

const profileUpdateSchema = Joi.object({
    username: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    password: Joi.string().min(6),
});

// ─── Routes ───────────────────────────────────────────────────────
router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

router
    .route("/profile")
    .get(protect, getUserProfile)
    .put(protect, validate(profileUpdateSchema), updateUserProfile);

// ─── Admin Routes ─────────────────────────────────────────────────
// Get All Users
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

// Delete User
router.delete("/:id", protect, admin, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }
        if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) {
            res.status(400);
            throw new Error("Cannot delete an elevated role user");
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

export default router;