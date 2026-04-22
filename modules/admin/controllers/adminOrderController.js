import { adminOrderService } from "../services/adminOrderService.js";

export const adminOrderController = {
    async list(req, res, next) {
        try {
            const orders = await adminOrderService.getOrders();
            res.status(200).json({ success: true, data: orders, message: "Orders fetched successfully" });
        } catch (error) {
            next(error);
        }
    },
    async updateStatus(req, res, next) {
        try {
            const order = await adminOrderService.updateOrderStatus(req.params.id, req.body.status);
            res.status(200).json({ success: true, data: order, message: "Order status updated successfully" });
        } catch (error) {
            next(error);
        }
    },
};
