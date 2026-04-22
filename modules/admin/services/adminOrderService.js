import { adminOrderRepository } from "../repositories/adminOrderRepository.js";

export const adminOrderService = {
    async getOrders() {
        return adminOrderRepository.findAll();
    },
    async updateOrderStatus(id, status) {
        const order = await adminOrderRepository.updateStatus(id, status);
        if (!order) {
            const error = new Error("Order not found");
            error.statusCode = 404;
            throw error;
        }
        return order;
    },
};
