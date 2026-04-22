import Order from "../models/Order.js";

// ─── POST /api/orders ─────────────────────────────────────────────
// Creates a new order from the checkout form + cart items.
export const createOrder = async (req, res, next) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

        if (!orderItems || orderItems.length === 0) {
            res.status(400);
            throw new Error("No order items provided");
        }

        
        // Simulate payment: card/paypal = immediately paid
        const isPaid = paymentMethod !== "Cash on Delivery";

        const order = await Order.create({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            status: "pending",
            isPaid,
            paidAt: isPaid ? new Date() : undefined,
        });

        res.status(201).json({ success: true, data: order, message: "Order created successfully" });
    } catch (err) {
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
        if (!isOwner && !req.user.isAdmin) {
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
