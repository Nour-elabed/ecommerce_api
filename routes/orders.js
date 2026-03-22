import express from "express";
import {
    createOrder,
    getUserOrders,
    getOrderById,
} from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All order routes require authentication
router.post("/", protect, createOrder);
router.get("/my", protect, getUserOrders);
router.get("/:id", protect, getOrderById);

export default router;
