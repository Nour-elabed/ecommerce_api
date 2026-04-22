import { adminProductService } from "../services/adminProductService.js";

export const adminProductController = {
    async create(req, res, next) {
        try {
            const product = await adminProductService.createProduct(req.body);
            res.status(201).json({ success: true, data: product, message: "Product created successfully" });
        } catch (error) {
            next(error);
        }
    },
    async list(req, res, next) {
        try {
            const products = await adminProductService.getProducts();
            res.status(200).json({ success: true, data: products, message: "Products fetched successfully" });
        } catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const product = await adminProductService.updateProduct(req.params.id, req.body);
            res.status(200).json({ success: true, data: product, message: "Product updated successfully" });
        } catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            await adminProductService.deleteProduct(req.params.id);
            res.status(200).json({ success: true, data: null, message: "Product deleted successfully" });
        } catch (error) {
            next(error);
        }
    },
};
