import Product from "../../../models/Product.js";

export const adminProductRepository = {
    async create(payload) {
        return Product.create(payload);
    },
    async findAll() {
        return Product.find({}).sort({ createdAt: -1 });
    },
    async findById(id) {
        return Product.findById(id);
    },
    async updateById(id, payload) {
        return Product.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    },
    async deleteById(id) {
        return Product.findByIdAndDelete(id);
    },
};
