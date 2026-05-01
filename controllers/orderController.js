import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { ROLES } from "../constants/roles.js";

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
            res.status(400);
            throw new Error("No order items provided");
        }

        // Validate shipping address
        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || 
            !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
            res.status(400);
            throw new Error("Complete shipping address is required");
        }

        // Simulate payment status
        const isPaid = paymentMethod !== "Cash on Delivery";

        // Enrich order items with seller info
        const enrichedOrderItems = [];
        for (const item of orderItems) {
            const productId = item.productId || item.product;
            
            if (!productId) {
                res.status(400);
                throw new Error(`Invalid product in order: missing product ID`);
            }

            let product = null;
            if (mongoose.Types.ObjectId.isValid(productId)) {
                product = await Product.findById(productId);
            }
            
            // Fallback for seller: product's seller -> first admin found -> current user
            let sellerId = product?.seller;
            if (!sellerId) {
                const adminUser = await User.findOne({ role: { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN] } });
                sellerId = adminUser?._id || req.user._id;
            }

            // Fallback for product ID if it's a seed string
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

        const order = await Order.create({
            user: new mongoose.Types.ObjectId(req.user._id),
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
