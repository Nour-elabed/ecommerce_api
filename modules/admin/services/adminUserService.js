import { ROLES } from "../../../constants/roles.js";
import { adminUserRepository } from "../repositories/adminUserRepository.js";

const isElevatedRole = (role) => role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;

export const adminUserService = {
    async getUsers() {
        return adminUserRepository.findAll();
    },
    async deleteUser(targetUserId, actorUserId) {
        if (targetUserId === actorUserId) {
            const error = new Error("You cannot delete your own account");
            error.statusCode = 400;
            throw error;
        }

        const targetUser = await adminUserRepository.findById(targetUserId);
        if (!targetUser) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        if (isElevatedRole(targetUser.role)) {
            const error = new Error("Cannot delete another admin user");
            error.statusCode = 400;
            throw error;
        }

        await adminUserRepository.deleteById(targetUserId);
        return true;
    },
    async updateUserRole(targetUserId, role, actorUserId) {
        if (targetUserId === actorUserId) {
            const error = new Error("You cannot change your own role");
            error.statusCode = 400;
            throw error;
        }

        const updatedUser = await adminUserRepository.updateRole(targetUserId, role);
        if (!updatedUser) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        return updatedUser;
    },
};
