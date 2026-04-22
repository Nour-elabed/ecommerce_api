import User from "../../../models/User.js";

export const adminUserRepository = {
    async findAll() {
        return User.find({}).select("-password").sort({ createdAt: -1 });
    },
    async findById(id) {
        return User.findById(id);
    },
    async deleteById(id) {
        return User.findByIdAndDelete(id);
    },
    async updateRole(id, role) {
        return User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true }).select("-password");
    },
};
