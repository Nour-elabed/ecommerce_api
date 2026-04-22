import Order from "../../../models/Order.js";

export const adminOrderRepository = {
    async findAll() {
        return Order.find({})
            .populate("user", "username email role")
            .sort({ createdAt: -1 });
    },
    async findById(id) {
        return Order.findById(id);
    },
    async updateStatus(id, status) {
        return Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).populate(
            "user",
            "username email role"
        );
    },
};
