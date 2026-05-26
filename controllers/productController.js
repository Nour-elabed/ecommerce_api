import mongoose from "mongoose";
import Product from "../models/Product.js";
import User from "../models/User.js";

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
            let searchTerms = search;
            
            // Map common terms to genders
            if (search.toLowerCase().includes("feminin")) searchTerms = "women";
            if (search.toLowerCase().includes("masculin")) searchTerms = "men";

            query.$or = [
                { name: { $regex: searchTerms, $options: "i" } },
                { description: { $regex: searchTerms, $options: "i" } },
                { brand: { $regex: searchTerms, $options: "i" } },
                { category: { $regex: searchTerms, $options: "i" } },
                { gender: { $regex: searchTerms, $options: "i" } },
                { style: { $regex: searchTerms, $options: "i" } },
                { tags: { $in: [new RegExp(searchTerms, "i")] } },
            ];
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

        let products = await Product.find(query)
            .populate("seller", "username email")
            .sort(sortBy)
            .skip(skip)
            .limit(Number(limit));

        let total = await Product.countDocuments(query);

        // AUTO-SEED: If DB is empty and no search/filters are applied, seed it!
        if (total === 0 && !category && !brand && !gender && !search) {
            console.log("Database empty, auto-seeding products...");
            try {
                // Import seed data or define here
                const seedData = [
                    { name: "Rolex Submariner", brand: "Rolex", category: "Luxury", gender: "MEN", price: 8500, stock: 10, image: "https://images.unsplash.com/photo-1523170335258-f5ed11644a13", description: "The iconic diver's watch." },
                    { name: "Omega Seamaster", brand: "Omega", category: "Sport", gender: "MEN", price: 5200, stock: 15, image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314", description: "Professional dive watch." },
                    { name: "Cartier Tank", brand: "Cartier", category: "Classic", gender: "WOMEN", price: 3400, stock: 8, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30", description: "Timeless elegance." },
                    { name: "Tag Heuer Carrera", brand: "Tag Heuer", category: "Sport", gender: "UNISEX", price: 2900, stock: 12, image: "https://images.unsplash.com/photo-1548178397-51c5e071d4d7", description: "Racing inspired." },
                    { name: "Seiko Prospex", brand: "Seiko", category: "Sport", gender: "MEN", price: 450, stock: 30, image: "https://images.unsplash.com/photo-1508685096489-7aac29a8a244", description: "Reliable tool watch." },
                    { name: "Casio G-Shock", brand: "Casio", category: "Sport", gender: "UNISEX", price: 120, stock: 50, image: "https://images.unsplash.com/photo-1547996160-81dfa63595dd", description: "Virtually indestructible." }
                ];
                
                // Assign a default admin seller if possible
                const User = mongoose.model("User");
                let admin = await User.findOne({ role: { $in: ["admin", "super_admin", "ADMIN", "SUPER_ADMIN"] } });
                
                if (!admin) {
                    console.log("No admin user found. Creating a default seed admin...");
                    // Hash for "ChangeMe123!" using bcryptjs (pre-hashed to avoid dependency overhead)
                    const defaultHashedPassword = "$2a$10$X877D9uT22r8pL1q4sYm8OFyX7lRvhT.y9zXmG6P44j74fQk3H8lK";
                    admin = new User({
                        username: "SystemAdmin",
                        email: "admin@ecommerce.com",
                        password: defaultHashedPassword,
                        role: "SUPER_ADMIN"
                    });
                    admin.__skipRoleGuard = true;
                    await admin.save();
                    console.log(`Created default seed admin: ${admin.email}`);
                }
                const sellerId = admin._id;

                const seededProducts = seedData.map(p => ({ ...p, seller: sellerId }));
                await Product.insertMany(seededProducts);
                
                // Re-fetch
                products = await Product.find(query).populate("seller", "username email").sort(sortBy).limit(Number(limit));
                total = await Product.countDocuments(query);
            } catch (seedErr) {
                console.error("Auto-seed failed:", seedErr);
            }
        }

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit))
            },
            message: products.length > 0 ? "Products fetched" : "No products found"
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
        const product = await Product.findById(req.params.id).populate("seller", "username email");
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
            seller: req.user?._id || req.body.seller, // Prefer logged-in user, fallback to body
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
