import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { ROLES } from "../constants/roles.js";

// Helper: check if a string is a valid Mongo ObjectId
const isValidObjectId = (id) => {
    if (!id) return false;
    if (typeof id === "object" && id._bsontype === "ObjectId") return true;
    return mongoose.Types.ObjectId.isValid(String(id)) && /^[0-9a-fA-F]{24}$/.test(String(id));
};

// Helper: strip base64 data from image strings (keep only URLs)
const sanitizeImage = (img) => {
    if (!img) return "/assets/images/placeholder.svg";
    if (typeof img === "string" && img.startsWith("data:")) {
        return "/assets/images/placeholder.svg";
    }
    return img;
};

// ─── POST /api/orders ─────────────────────────────────────────────
// Creates a new order from the checkout form + cart items.
export const createOrder = async (req, res, next) => {
    try {
        const { 
            orderItems, 
            shippingAddress, 
            paymentMethod, 
            itemsPrice, 
            taxPrice, 
            shippingPrice, 
            totalPrice 
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ success: false, message: "No order items provided" });
        }

        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || 
            !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
            return res.status(400).json({ success: false, message: "Complete shipping address is required" });
        }

        // Simulate payment status
        const isPaid = paymentMethod !== "Cash on Delivery";

        // Find a fallback seller (admin or current user) once, not per-item
        let fallbackSeller = req.user._id;
        try {
            const adminUser = await User.findOne({ role: { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN] } });
            if (adminUser) fallbackSeller = adminUser._id;
        } catch (e) {
            console.warn("Could not find admin user for fallback seller:", e.message);
        }

        // Enrich order items with seller info
        const enrichedOrderItems = [];
        for (const item of orderItems) {
            const rawId = item.productId || item.product;
            
            if (!rawId) {
                return res.status(400).json({ success: false, message: "Order item missing product ID" });
            }

            let dbProduct = null;
            let sellerId = fallbackSeller;
            let finalProductId;

            // Only look up DB product if it's a valid Mongo ObjectId
            if (isValidObjectId(rawId)) {
                try {
                    dbProduct = await Product.findById(rawId);
                } catch (e) {
                    console.warn(`Product lookup failed for ${rawId}:`, e.message);
                }
                finalProductId = new mongoose.Types.ObjectId(String(rawId));
                if (dbProduct?.seller) {
                    sellerId = dbProduct.seller;
                }
            } else {
                // Seed product — generate a random ObjectId
                finalProductId = new mongoose.Types.ObjectId();
            }

            enrichedOrderItems.push({
                product: finalProductId,
                seller: sellerId,
                name: item.name || "Unknown Product",
                image: sanitizeImage(item.image),
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 1,
            });
        }

        const orderDoc = {
            user: req.user._id,
            orderItems: enrichedOrderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice: Number(itemsPrice) || 0,
            taxPrice: Number(taxPrice) || 0,
            shippingPrice: Number(shippingPrice) || 0,
            totalPrice: Number(totalPrice) || 0,
            status: "pending",
            isPaid,
            paidAt: isPaid ? new Date() : undefined,
        };

        console.log("[ORDER] Creating order with:", JSON.stringify({
            user: orderDoc.user,
            itemCount: enrichedOrderItems.length,
            paymentMethod: orderDoc.paymentMethod,
            totalPrice: orderDoc.totalPrice,
            items: enrichedOrderItems.map(i => ({ product: String(i.product), seller: String(i.seller), name: i.name })),
        }, null, 2));

        // Split create into new + validate + save for better error diagnostics
        const order = new Order(orderDoc);

        const validationError = order.validateSync();
        if (validationError) {
            console.error("[ORDER] Validation failed:", validationError.message);
            return res.status(400).json({
                success: false,
                message: "Order validation failed: " + validationError.message,
            });
        }

        await order.save();

        return res.status(201).json({ success: true, data: order, message: "Order created successfully" });
    } catch (err) {
        console.error("[ORDER] Creation error:", err.message);
        console.error("[ORDER] Error name:", err.name);
        console.error("[ORDER] Full error:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        // Return explicit 500 with message instead of relying on error handler
        if (!res.headersSent) {
            return res.status(500).json({ 
                success: false, 
                message: err.message || "Failed to create order" 
            });
        }
        next(err);
    }
};

// ─── GET /api/orders/my ───────────────────────────────────────────
// Returns all orders for the logged-in user.
export const getUserOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: orders, message: "Orders fetched" });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/orders/:id ──────────────────────────────────────────
// Returns a single order. Only the owner or an admin can view it.
export const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "username email");
        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }
        const isOwner = order.user._id.toString() === req.user._id.toString();
        const userRole = req.user.role || (req.user.isAdmin ? ROLES.ADMIN : ROLES.USER);
        const isElevated = userRole === ROLES.ADMIN || userRole === ROLES.SUPER_ADMIN;
        if (!isOwner && !isElevated) {
            res.status(403);
            throw new Error("Not authorized to view this order");
        }
        res.status(200).json({ success: true, data: order, message: "Order fetched" });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/orders (admin) ──────────────────────────────────────
export const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({}).populate("user", "id username").sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: orders, message: "All orders fetched" });
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/orders/:id/deliver (admin) ──────────────────────────
export const updateOrderToDelivered = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        order.status = "delivered";
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        const updatedOrder = await order.save();

        res.status(200).json({ success: true, data: updatedOrder, message: "Order marked as delivered" });
    } catch (err) {
        next(err);
    }
};
