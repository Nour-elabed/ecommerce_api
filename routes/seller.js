import express from "express";
import { protect } from "../middleware/auth.js";
import {
    getSellerProducts,
    createSellerProduct,
    updateSellerProduct,
    deleteSellerProduct,
    getSellerOrders,
} from "../controllers/sellerController.js";

const router = express.Router();

router.use(protect); // All seller routes require authentication

router.get("/products", getSellerProducts);
router.post("/products", createSellerProduct);
router.put("/products/:id", updateSellerProduct);
router.delete("/products/:id", deleteSellerProduct);
router.get("/orders", getSellerOrders);

export default router;
