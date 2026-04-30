import express from "express";
import rateLimit from "express-rate-limit";
import { setupSuperAdmin } from "../controllers/setupController.js";

const router = express.Router();

// Aggressive rate limit: max 5 attempts per hour per IP.
const setupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many setup attempts." },
});

router.post("/superadmin", setupLimiter, setupSuperAdmin);

export default router;
