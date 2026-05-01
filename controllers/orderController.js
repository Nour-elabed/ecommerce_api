import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { ROLES } from "../constants/roles.js";

// ─── POST /api/orders ─────────────────────────────────────────────
// Creates a new order from the checkout form + cart items.
export const createOrder = async (req, res, next) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

        if (!orderItems || orderItems.length === 0) {
            res.status(400);
            throw new Error("No order items provided");
        }

        // Validate shipping address
        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || 
            !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
            res.status(400);
            throw new Error("Complete shipping address is required");
        }

        // Simulate payment: card/paypal = immediately paid
        const isPaid = paymentMethod !== "Cash on Delivery";

        // Enrich order items with seller info from the database
        const enrichedOrderItems = [];
        for (const item of orderItems) {
            const productId = item.productId || item.product;
            
            if (!productId) {
                res.status(400);
                throw new Error(`Invalid product in order: missing product ID`);
            }

            // Try to find the product
            let product = null;
            
            // CRITICAL: Validate ObjectId to prevent 500 cast errors
            if (mongoose.Types.ObjectId.isValid(productId)) {
                product = await Product.findById(productId);
            }
            
            // If product not found in DB, use a default seller (for seed products or missing ones)
            let sellerId = product?.seller;
            if (!sellerId) {
                // Find an admin user to assign as seller, or use the current user if no admin exists
                // Note: constants/roles.js uses UPPERCASE: ROLES.ADMIN, ROLES.SUPER_ADMIN
                const adminUser = await User.findOne({ role: { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN] } });
                sellerId = adminUser?._id || req.user._id;
            }

            // Generate a valid ObjectId for the product field if the input was a seed ID
            const finalProductId = mongoose.Types.ObjectId.isValid(productId) 
                ? new mongoose.Types.ObjectId(productId) 
                : new mongoose.Types.ObjectId(); 

            enrichedOrderItems.push({
                product: finalProductId,
                seller: new mongoose.Types.ObjectId(sellerId),
                name: item.name || 'Unknown Product',
                image: item.image || '/assets/images/placeholder.svg',
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 1,
            });
        }

        console.log('Final Order Items:', JSON.stringify(enrichedOrderItems, null, 2));

        const order = await Order.create({
            user: new mongoose.Types.ObjectId(req.user._id),
            orderItems: enrichedOrderItems,
            shippingAddress,
            paymentMethod,
            totalPrice: Number(totalPrice) || 0,
            status: "pending",
            isPaid,
            paidAt: isPaid ? new Date() : undefined,
        });

        res.status(201).json({ success: true, data: order, message: "Order created successfully" });
    } catch (err) {
        console.error('Order creation error details:', err.message);
        console.error(err.stack);
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
        if (!isOwner && userRole !== ROLES.ADMIN) {
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
