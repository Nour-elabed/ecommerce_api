import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { ROLES } from "../constants/roles.js";

// @desc    Get all products for the logged-in seller
// @route   GET /api/seller/products
// @access  Private/Seller
export const getSellerProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: products, message: "Seller products fetched" });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a product as a seller
// @route   POST /api/seller/products
// @access  Private/Seller
export const createSellerProduct = async (req, res, next) => {
    try {
        const productData = {
            ...req.body,
            price: Number(req.body.price),
            stock: Number(req.body.stock),
            seller: req.user._id, // Set the seller to the logged-in user
        };
        const product = await Product.create(productData);
        res.status(201).json({ success: true, data: product, message: "Product created" });
    } catch (err) {
        next(err);
    }
};

// @desc    Update a seller's product
// @route   PUT /api/seller/products/:id
// @access  Private/Seller
export const updateSellerProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        // Only allow owner or Admin/SuperAdmin
        const isOwner = product.seller.toString() === req.user._id.toString();
        const isAdmin = req.user.role === ROLES.ADMIN || req.user.role === ROLES.SUPER_ADMIN;

        if (!isOwner && !isAdmin) {
            res.status(403);
            throw new Error("Not authorized to edit this product");
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: updatedProduct, message: "Product updated" });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a seller's product
// @route   DELETE /api/seller/products/:id
// @access  Private/Seller
export const deleteSellerProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        // Only allow owner or Admin/SuperAdmin
        const isOwner = product.seller.toString() === req.user._id.toString();
        const isAdmin = req.user.role === ROLES.ADMIN || req.user.role === ROLES.SUPER_ADMIN;

        if (!isOwner && !isAdmin) {
            res.status(403);
            throw new Error("Not authorized to delete this product");
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {}, message: "Product deleted" });
    } catch (err) {
        next(err);
    }
};

// @desc    Get orders containing seller's products
// @route   GET /api/seller/orders
// @access  Private/Seller
export const getSellerOrders = async (req, res, next) => {
    try {
        // Find orders that contain at least one item from this seller
        const orders = await Order.find({
            "orderItems.seller": req.user._id
        }).populate("user", "username email").sort({ createdAt: -1 });

        // For each order, only return the items belonging to this seller
        const sellerOrders = orders.map(order => {
            const items = order.orderItems.filter(item => item.seller.toString() === req.user._id.toString());
            const sellerTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            
            return {
                _id: order._id,
                user: order.user,
                items,
                totalEarned: sellerTotal,
                status: order.status,
                createdAt: order.createdAt
            };
        });

        res.status(200).json({ success: true, data: sellerOrders, message: "Seller orders fetched" });
    } catch (err) {
        next(err);
    }
};
