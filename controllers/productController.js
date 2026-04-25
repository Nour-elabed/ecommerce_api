import Product from "../models/Product.js";

// @desc    Fetch all products with advanced filtering
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res, next) => {
    try {
        const { 
            category, 
            brand, 
            gender, 
            minPrice, 
            maxPrice, 
            search,
            sort,
            page = 1,
            limit = 12
        } = req.query;

        const query = {};

        // Filtering
        if (category) {
            query.category = { $in: category.split(",") };
        }
        if (brand) {
            query.brand = { $in: brand.split(",") };
        }
        if (gender && gender !== "ALL") {
            query.gender = gender;
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        // Sorting
        let sortBy = { createdAt: -1 };
        if (sort) {
            if (sort === "price-asc") sortBy = { price: 1 };
            else if (sort === "price-desc") sortBy = { price: -1 };
            else if (sort === "rating") sortBy = { rating: -1 };
        }

        // Pagination
        const skip = (Number(page) - 1) * Number(limit);

        const products = await Product.find(query)
            .sort(sortBy)
            .skip(skip)
            .limit(Number(limit));

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit))
            },
            message: "Products fetched"
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
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

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
    try {
        const productData = {
            ...req.body,
            price: Number(req.body.price),
            stock: Number(req.body.stock),
        };
        const product = await Product.create(productData);
        res.status(201).json({ success: true, data: product, message: "Product created" });
    } catch (err) {
        next(err);
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
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

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
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
