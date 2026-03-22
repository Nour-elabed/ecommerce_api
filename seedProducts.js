/**
 * Product Seeder Script
 * Run from Backend/ directory: node seedProducts.js
 *
 * Seeds 12 diverse products across categories:
 * Electronics, Clothing, Accessories, Home, Sports, Beauty
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import Product from "./models/Product.js";

const products = [
    {
        name: "Black Automatic Watch",
        description: "Premium automatic movement watch with sapphire crystal glass and genuine leather strap. Water resistant to 50m.",
        price: 169.99,
        category: "Accessories",
        image: "/assets/images/watch.svg",
        stock: 25,
        rating: 4.9,
        numReviews: 98,
    },
    {
        name: "Wireless Noise-Cancelling Headphones",
        description: "40-hour battery life, Bluetooth 5.0, active noise cancellation. Foldable design for portability.",
        price: 249.99,
        category: "Electronics",
        image: "/assets/images/watch.svg",
        stock: 40,
        rating: 4.8,
        numReviews: 215,
    },
    {
        name: "Men's Slim Fit Dress Shirt",
        description: "100% premium cotton, wrinkle resistant. Available in white and light blue. Perfect for business casual.",
        price: 49.99,
        category: "Clothing",
        image: "/assets/images/watch.svg",
        stock: 80,
        rating: 4.5,
        numReviews: 134,
    },
    {
        name: "Minimalist Leather Wallet",
        description: "RFID blocking slim bifold wallet. Genuine full-grain leather. Holds up to 8 cards.",
        price: 39.99,
        category: "Accessories",
        image: "/assets/images/watch.svg",
        stock: 60,
        rating: 4.7,
        numReviews: 77,
    },
    {
        name: "Smart Fitness Tracker",
        description: "Heart rate monitor, sleep tracking, GPS. 7-day battery, IP68 waterproof.",
        price: 89.99,
        category: "Electronics",
        image: "/assets/images/watch.svg",
        stock: 35,
        rating: 4.6,
        numReviews: 189,
    },
    {
        name: "Women's Running Shoes",
        description: "Lightweight responsive foam cushioning. Breathable mesh upper. Ideal for road running.",
        price: 119.99,
        category: "Sports",
        image: "/assets/images/watch.svg",
        stock: 50,
        rating: 4.8,
        numReviews: 302,
    },
    {
        name: "Scented Soy Candle Set",
        description: "Set of 3 hand-poured soy wax candles: Lavender, Vanilla, and Eucalyptus. 40-hour burn time each.",
        price: 34.99,
        category: "Home",
        image: "/assets/images/watch.svg",
        stock: 70,
        rating: 4.9,
        numReviews: 56,
    },
    {
        name: "Vitamin C Brightening Serum",
        description: "15% Vitamin C + Hyaluronic Acid formula. Reduces dark spots and boosts collagen production. 30ml.",
        price: 44.99,
        category: "Beauty",
        image: "/assets/images/watch.svg",
        stock: 90,
        rating: 4.7,
        numReviews: 428,
    },
    {
        name: "Stainless Steel Water Bottle",
        description: "24oz double-wall vacuum insulation. Keeps drinks cold 24h or hot 12h. BPA-free lid.",
        price: 29.99,
        category: "Sports",
        image: "/assets/images/watch.svg",
        stock: 100,
        rating: 4.6,
        numReviews: 153,
    },
    {
        name: "Mechanical Keyboard",
        description: "TKL layout, Cherry MX Blue switches, RGB backlit. USB-C detachable cable. N-key rollover.",
        price: 129.99,
        category: "Electronics",
        image: "/assets/images/watch.svg",
        stock: 20,
        rating: 4.8,
        numReviews: 87,
    },
    {
        name: "Linen Throw Blanket",
        description: "Oversized 60x80\" breathable cotton-linen blend. Herringbone weave. Available in 5 neutral colors.",
        price: 59.99,
        category: "Home",
        image: "/assets/images/watch.svg",
        stock: 45,
        rating: 4.9,
        numReviews: 63,
    },
    {
        name: "Retro Sunglasses",
        description: "UV400 polarized lenses. Acetate frame. Unisex round shape. Includes case and cleaning cloth.",
        price: 79.99,
        category: "Accessories",
        image: "/assets/images/watch.svg",
        stock: 55,
        rating: 4.5,
        numReviews: 91,
    },
];

const seed = async () => {
    try {
        await connectDB();
        await Product.deleteMany({});
        const inserted = await Product.insertMany(products);
        console.log(`✅ Seeded ${inserted.length} products successfully!`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err.message);
        process.exit(1);
    }
};

seed();
