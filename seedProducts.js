import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import Product from "./models/Product.js";

const products = [
    // Generated below
];

const categories = ["Luxury", "Sport", "Classic", "Smart", "Minimalist"];
const brands = [
    "Rolex",
    "Omega",
    "Cartier",
    "Tag Heuer",
    "Seiko",
    "Casio",
    "Tudor",
    "Longines",
    "Breitling",
    "Hamilton",
];

const images = [
    "https://images.unsplash.com/photo-1523170335258-f5ed11644a13?auto=format&fit=crop&q=80&w=900",
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=900",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=900",
    "https://images.unsplash.com/photo-1548178397-51c5e071d4d7?auto=format&fit=crop&q=80&w=900",
    "https://images.unsplash.com/photo-1508685096489-7aac29a8a244?auto=format&fit=crop&q=80&w=900",
    "https://images.unsplash.com/photo-1547996160-81dfa63595dd?auto=format&fit=crop&q=80&w=900",
];

const pick = (arr, i) => arr[i % arr.length];

const makeProduct = ({ gender, i }) => {
    const brand = pick(brands, i);
    const category = pick(categories, i);
    const name = `${brand} ${category} Series ${i + 1}`;
    return {
        name,
        brand,
        description: `A premium ${category.toLowerCase()} timepiece designed for ${gender.toLowerCase()} customers. Built with durable materials, precision movement, and modern styling.`,
        price: Number((199 + (i % 10) * 85 + (gender === "WOMEN" ? 40 : 0)).toFixed(2)),
        category,
        gender,
        image: pick(images, i),
        stock: 5 + (i % 20),
        rating: 4.3 + ((i % 7) * 0.1),
        numReviews: 10 + (i % 90),
    };
};

// Build exactly 60 products:
// 20 WOMEN, 20 MEN, 20 UNISEX
products.length = 0;
for (let i = 0; i < 20; i++) products.push(makeProduct({ gender: "WOMEN", i }));
for (let i = 0; i < 20; i++) products.push(makeProduct({ gender: "MEN", i: i + 20 }));
for (let i = 0; i < 20; i++) products.push(makeProduct({ gender: "UNISEX", i: i + 40 }));

const seedProducts = async () => {
    try {
        await connectDB();
        
        await Product.deleteMany({});
        await Product.insertMany(products);
        
        console.log(`✅ Successfully seeded ${products.length} products`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts();
