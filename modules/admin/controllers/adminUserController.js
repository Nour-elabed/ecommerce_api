import { adminUserService } from "../services/adminUserService.js";

export const adminUserController = {
    async list(req, res, next) {
        try {
            const users = await adminUserService.getUsers();
            res.status(200).json({ success: true, data: users, message: "Users fetched successfully" });
        } catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            await adminUserService.deleteUser(req.params.id, req.user._id.toString());
            res.status(200).json({ success: true, data: null, message: "User deleted successfully" });
        } catch (error) {
            next(error);
        }
    },
    async updateRole(req, res, next) {
        try {
            const updatedUser = await adminUserService.updateUserRole(
                req.params.id,
                req.body.role,
                req.user._id.toString()
            );
            res.status(200).json({ success: true, data: updatedUser, message: "User role updated successfully" });
        } catch (error) {
            next(error);
        }
    },
};
