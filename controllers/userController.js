import User from "../models/User.js";
import { ROLES } from "../constants/roles.js";

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password").sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: users, message: "Users fetched" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/admin/users/:id
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, data: user, message: "User fetched" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/admin/users/:id/role
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = Object.values(ROLES);

        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role" });
        }
        if (role === ROLES.SUPER_ADMIN) {
            return res.status(400).json({ success: false, message: "SUPER_ADMIN cannot be assigned through this endpoint" });
        }
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({ success: false, message: "You cannot change your own role" });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (user.role === ROLES.SUPER_ADMIN) {
            return res.status(403).json({ success: false, message: "Cannot modify a SUPER_ADMIN" });
        }

        user.role = role;
        user.__skipRoleGuard = true;
        const updated = await user.save();

        return res.status(200).json({
            success: true,
            data: {
                id: updated._id,
                username: updated.username,
                email: updated.email,
                role: updated.role,
            },
            message: "Role updated",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
    try {
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({ success: false, message: "You cannot delete yourself" });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (user.role === ROLES.SUPER_ADMIN) {
            return res.status(403).json({ success: false, message: "Cannot delete a SUPER_ADMIN" });
        }

        await user.deleteOne();
        return res.status(200).json({ success: true, message: "User deleted" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
