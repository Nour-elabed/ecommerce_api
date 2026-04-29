import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const STATUS_KEYS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const buildStatusCounts = (rawCounts) => {
    const base = STATUS_KEYS.reduce((acc, key) => {
        acc[key] = 0;
        return acc;
    }, {});

    rawCounts.forEach(({ _id, count }) => {
        if (!_id) return;
        // Tolerate American spelling stored historically.
        const normalized = _id === "canceled" ? "cancelled" : _id;
        if (Object.prototype.hasOwnProperty.call(base, normalized)) {
            base[normalized] += count;
        }
    });

    return base;
};

// GET /api/admin/stats
export const getDashboardStats = async (_req, res) => {
    try {
        const [totalUsers, totalProducts, totalOrders, revenueAgg, statusAgg, recentOrdersDocs] =
            await Promise.all([
                User.countDocuments(),
                Product.countDocuments(),
                Order.countDocuments(),
                Order.aggregate([
                    { $match: { isPaid: true } },
                    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
                ]),
                Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
                Order.find({})
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .populate("user", "username")
                    .select("_id user totalPrice status createdAt")
                    .lean(),
            ]);

        const totalRevenue = revenueAgg[0]?.total ?? 0;
        const ordersByStatus = buildStatusCounts(statusAgg);

        const recentOrders = recentOrdersDocs.map((order) => ({
            _id: String(order._id),
            user: { username: order.user?.username ?? "Unknown" },
            totalPrice: order.totalPrice ?? 0,
            status: order.status === "canceled" ? "cancelled" : order.status,
            createdAt: order.createdAt,
        }));

        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue,
                recentOrders,
                ordersByStatus,
            },
        });
    } catch (error) {
        console.error("[getDashboardStats]", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};
