/**
 * Product Seeder Script
 * Run from Backend/ directory: node seedProducts.js
 *
 * Seeds diverse watches for MEN and WOMEN categories
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import Product from "./models/Product.js";

const products = [
    // MEN'S WATCHES
    {
        name: "Classic Men's Chronograph",
        description: "Elegant men's watch with chronograph function, stainless steel case, and genuine leather strap. Perfect for business and casual wear.",
        price: 299.99,
        category: "MEN",
        image: "/assets/images/mens-watch-1.jpg",
        stock: 15,
        rating: 4.7,
        numReviews: 124,
    },
    {
        name: "Sport Men's Diver Watch",
        description: "Professional men's dive watch with 200m water resistance, unidirectional bezel, and luminous hands. Built for adventure.",
        price: 449.99,
        category: "MEN",
        image: "/assets/images/mens-watch-2.jpg",
        stock: 8,
        rating: 4.8,
        numReviews: 89,
    },
    {
        name: "Minimalist Men's Watch",
        description: "Clean and minimalist men's watch design with Japanese movement, mesh strap, and date function. Modern sophistication.",
        price: 189.99,
        category: "MEN",
        image: "/assets/images/mens-watch-3.jpg",
        stock: 22,
        rating: 4.6,
        numReviews: 156,
    },
    {
        name: "Luxury Men's Automatic",
        description: "Premium men's automatic watch with exhibition case back, blue hands, and alligator leather strap. Swiss movement.",
        price: 899.99,
        category: "MEN",
        image: "/assets/images/mens-watch-4.jpg",
        stock: 5,
        rating: 4.9,
        numReviews: 67,
    },
    // WOMEN'S WATCHES
    {
        name: "Elegant Women's Watch",
        description: "Delicate women's watch with mother-of-pearl dial, rose gold case, and bracelet strap. Perfect for special occasions.",
        price: 259.99,
        category: "WOMEN",
        image: "/assets/images/womens-watch-1.jpg",
        stock: 18,
        rating: 4.8,
        numReviews: 203,
    },
    {
        name: "Women's Fashion Watch",
        description: "Trendy women's watch with crystal-studded bezel, pink dial, and silicone strap. Water resistant and stylish.",
        price: 149.99,
        category: "WOMEN",
        image: "/assets/images/womens-watch-2.jpg",
        stock: 31,
        rating: 4.5,
        numReviews: 178,
    },
    {
        name: "Classic Women's Timepiece",
        description: "Timeless women's watch with Roman numerals, two-tone case, and expandable bracelet. Versatile elegance.",
        price: 329.99,
        category: "WOMEN",
        image: "/assets/images/womens-watch-3.jpg",
        stock: 12,
        rating: 4.7,
        numReviews: 94,
    },
    {
        name: "Sport Women's Watch",
        description: "Active women's sports watch with stopwatch function, durable case, and comfortable rubber strap. Built for performance.",
        price: 199.99,
        category: "WOMEN",
        image: "/assets/images/womens-watch-4.jpg",
        stock: 25,
        rating: 4.6,
        numReviews: 142,
    }
];
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
