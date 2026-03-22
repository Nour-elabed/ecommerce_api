import express from "express";
import { protect } from "../middleware/auth.js";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

// All routes require authentication via the existing protect middleware
router.get("/", protect, getCart);           // fetch the user's cart
router.post("/", protect, addToCart);        // add / increment an item
router.put("/:productId", protect, updateCartItem);    // set quantity
router.delete("/:productId", protect, removeFromCart); // remove one item
router.delete("/", protect, clearCart);      // wipe cart

export default router;
