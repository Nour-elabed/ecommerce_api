import express from "express";
import {
    createOrder,
    getUserOrders,
    getOrderById,
    getOrders,
    updateOrderToDelivered,
} from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";
import { isAdmin } from "../middleware/authorize.js";

const router = express.Router();

// All order routes require authentication
router.post("/", protect, createOrder);
router.get("/my", protect, getUserOrders);
router.get("/:id", protect, getOrderById);

// Admin-only routes
router.get("/", protect, isAdmin, getOrders);
router.put("/:id/deliver", protect, isAdmin, updateOrderToDelivered);

export default router;
