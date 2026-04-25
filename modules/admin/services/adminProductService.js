import { adminProductRepository } from "../repositories/adminProductRepository.js";

export const adminProductService = {
    async createProduct(payload) {
        return adminProductRepository.create(payload);
    },
    async getProducts() {
        return adminProductRepository.findAll();
    },
    async updateProduct(id, payload) {
        const product = await adminProductRepository.updateById(id, payload);
        if (!product) {
            const error = new Error("Product not found");
            error.statusCode = 404;
            throw error;
        }
        return product;
    },
    async deleteProduct(id) {
        const product = await adminProductRepository.deleteById(id);
        if (!product) {
            const error = new Error("Product not found");
            error.statusCode = 404;
            throw error;
        }
        return true;
    },
};
