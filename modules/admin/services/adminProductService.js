import { adminProductRepository } from "../repositories/adminProductRepository.js";

const toPersistenceProduct = (payload) => ({
    ...payload,
    title: payload.title,
    name: payload.title,
});

export const adminProductService = {
    async createProduct(payload) {
        return adminProductRepository.create(toPersistenceProduct(payload));
    },
    async getProducts() {
        return adminProductRepository.findAll();
    },
    async updateProduct(id, payload) {
        const product = await adminProductRepository.updateById(id, toPersistenceProduct(payload));
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
