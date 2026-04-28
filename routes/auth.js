import express from "express";
import Joi from "joi";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
} from "../controllers/authController.js";

const router = express.Router();

const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const profileUpdateSchema = Joi.object({
    username: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    password: Joi.string().min(6),
});

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

router
    .route("/profile")
    .get(protect, getUserProfile)
    .put(protect, validate(profileUpdateSchema), updateUserProfile);

export default router;