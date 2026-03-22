import Product from "../models/Product.js";

// ─── GET /api/products ─────────────────────────────────────────────────────
// Returns all products. Supports optional ?category= filter.
export const getAllProducts = async (req, res, next) => {
    try {
        const filter = req.query.category ? { category: req.query.category } : {};
        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: products, message: "Products fetched" });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/products/:id ─────────────────────────────────────────────────
export const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }
        res.status(200).json({ success: true, data: product, message: "Product fetched" });
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/products (admin) ────────────────────────────────────────────
export const createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product, message: "Product created" });
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/products/:id (admin) ────────────────────────────────────────
export const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }
        res.status(200).json({ success: true, data: product, message: "Product updated" });
    } catch (err) {
        next(err);
    }
};

// ─── DELETE /api/products/:id (admin) ─────────────────────────────────────
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }
        res.status(200).json({ success: true, data: {}, message: "Product deleted" });
    } catch (err) {
        next(err);
    }
};
