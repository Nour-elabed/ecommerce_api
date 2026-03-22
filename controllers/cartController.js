import Cart from "../models/Cart.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/cart  →  fetch the current user's cart
// ─────────────────────────────────────────────────────────────────────────────
export const getCart = async (req, res) => {
    try {
        // Find or create an empty cart for this user so the client always
        // receives a consistent shape: { user, items, _id, timestamps }
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }
        res.status(200).json(cart);
    } catch (err) {
        console.error("GET CART ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/cart  →  add or increment a product in the cart
// Body: { productId, name, price, image, quantity }
// ─────────────────────────────────────────────────────────────────────────────
export const addToCart = async (req, res) => {
    const { productId, name, price, image, quantity = 1 } = req.body;

    if (!productId || !name || price == null) {
        return res.status(400).json({ message: "productId, name, and price are required" });
    }

    try {
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            // First time — create a cart with this item
            cart = await Cart.create({
                user: req.user._id,
                items: [{ productId, name, price, image, quantity }],
            });
        } else {
            const existingItem = cart.items.find((item) => item.productId === productId);

            if (existingItem) {
                // Product already in cart → just increment quantity
                existingItem.quantity += quantity;
            } else {
                // New product → push onto items array
                cart.items.push({ productId, name, price, image, quantity });
            }

            await cart.save();
        }

        res.status(200).json(cart);
    } catch (err) {
        console.error("ADD TO CART ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/cart/:productId  →  set the exact quantity for one item
// Body: { quantity }
// ─────────────────────────────────────────────────────────────────────────────
export const updateCartItem = async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity == null || quantity < 1) {
        return res.status(400).json({ message: "quantity must be at least 1" });
    }

    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const item = cart.items.find((i) => i.productId === productId);
        if (!item) return res.status(404).json({ message: "Item not found in cart" });

        item.quantity = quantity;
        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        console.error("UPDATE CART ITEM ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/cart/:productId  →  remove one product from the cart
// ─────────────────────────────────────────────────────────────────────────────
export const removeFromCart = async (req, res) => {
    const { productId } = req.params;

    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter((item) => item.productId !== productId);
        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        console.error("REMOVE FROM CART ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/cart  →  wipe all items from the cart (keep the document)
// ─────────────────────────────────────────────────────────────────────────────
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.status(200).json({ message: "Cart cleared" });
    } catch (err) {
        console.error("CLEAR CART ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};
