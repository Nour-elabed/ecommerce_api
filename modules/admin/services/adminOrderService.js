import { adminOrderRepository } from "../repositories/adminOrderRepository.js";
import User from "../../../models/User.js";

export const adminOrderService = {
    async getOrders() {
        return adminOrderRepository.findAll();
    },
    async updateOrderStatus(id, status) {
        const existing = await adminOrderRepository.findById(id);
        if (!existing) {
            const error = new Error("Order not found");
            error.statusCode = 404;
            throw error;
        }

        const order = await adminOrderRepository.updateStatus(id, status);

        // Credit seller balances exactly once when transitioning to "shipped"
        if (status === "shipped" && existing.status !== "shipped") {
            const sellerCredits = new Map();
            for (const item of existing.orderItems) {
                const sellerStr = String(item.seller);
                if (sellerStr === String(existing.user)) continue; // skip self-purchases
                const lineTotal = item.price * item.quantity;
                sellerCredits.set(sellerStr, (sellerCredits.get(sellerStr) || 0) + lineTotal);
            }
            for (const [sellerId, amount] of sellerCredits.entries()) {
                try {
                    await User.findByIdAndUpdate(sellerId, { $inc: { balance: amount } });
                } catch (e) {
                    console.warn(`Failed to credit seller ${sellerId}:`, e.message);
                }
            }
        }

        return order;
    },
};
