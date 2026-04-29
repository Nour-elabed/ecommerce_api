import express from "express";
import { protect } from "../middleware/auth.js";
import { isAdmin, isSuperAdmin } from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import { adminProductController } from "../modules/admin/controllers/adminProductController.js";
import { adminOrderController } from "../modules/admin/controllers/adminOrderController.js";
import {
    adminCreateOrUpdateProductSchema,
    adminUpdateOrderStatusSchema,
} from "../modules/admin/validators/adminValidators.js";
import {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
} from "../controllers/userController.js";
import { getDashboardStats } from "../controllers/adminStatsController.js";

const router = express.Router();

router.use(protect, isAdmin);

// Dashboard stats (admin + super admin)
router.get("/stats", getDashboardStats);

// Products (admin + super admin)
router.get("/products", adminProductController.list);
router.post("/products", validate(adminCreateOrUpdateProductSchema), adminProductController.create);
router.put("/products/:id", validate(adminCreateOrUpdateProductSchema), adminProductController.update);
router.delete("/products/:id", adminProductController.remove);

// Orders (admin + super admin)
router.get("/orders", adminOrderController.list);
router.patch("/orders/:id/status", validate(adminUpdateOrderStatusSchema), adminOrderController.updateStatus);

// User management (super admin only)
router.get("/users", isSuperAdmin, getAllUsers);
router.get("/users/:id", isSuperAdmin, getUserById);
router.put("/users/:id/role", isSuperAdmin, updateUserRole);
router.delete("/users/:id", isSuperAdmin, deleteUser);

export default router;

