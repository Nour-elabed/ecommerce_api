import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize, ROLES } from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import { adminProductController } from "../modules/admin/controllers/adminProductController.js";
import { adminUserController } from "../modules/admin/controllers/adminUserController.js";
import { adminOrderController } from "../modules/admin/controllers/adminOrderController.js";
import {
    adminCreateOrUpdateProductSchema,
    adminUpdateOrderStatusSchema,
    adminUpdateUserRoleSchema,
} from "../modules/admin/validators/adminValidators.js";

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get("/products", adminProductController.list);
router.post("/products", validate(adminCreateOrUpdateProductSchema), adminProductController.create);
router.put("/products/:id", validate(adminCreateOrUpdateProductSchema), adminProductController.update);
router.delete("/products/:id", adminProductController.remove);

router.get("/users", authorize(ROLES.SUPER_ADMIN), adminUserController.list);
router.patch("/users/:id/role", authorize(ROLES.SUPER_ADMIN), validate(adminUpdateUserRoleSchema), adminUserController.updateRole);
router.delete("/users/:id", authorize(ROLES.SUPER_ADMIN), adminUserController.remove);

router.get("/orders", adminOrderController.list);
router.patch("/orders/:id/status", validate(adminUpdateOrderStatusSchema), adminOrderController.updateStatus);

export default router;
