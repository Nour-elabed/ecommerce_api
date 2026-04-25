import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import Product from "./models/Product.js";

const products = [
    // MEN'S WATCHES
    {
        name: "Submariner Date",
        brand: "Rolex",
        description: "The Rolex Submariner's robust and functional design swiftly became iconic. With its subtly redesigned Oyster case, distinctive dial with large luminescent hour markers.",
        price: 9500.00,
        category: "Luxury",
        gender: "MEN",
        image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50bd?w=800&q=80",
        stock: 5,
        rating: 4.9,
        numReviews: 45,
    },
    {
        name: "Speedmaster Moonwatch",
        brand: "Omega",
        description: "The Speedmaster Moonwatch is one of the world's most iconic timepieces. Having been a part of all six moon missions, the legendary chronograph is an impressive representation of the brand's adventurous pioneering spirit.",
        price: 6400.00,
        category: "Luxury",
        gender: "MEN",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
        stock: 10,
        rating: 4.8,
        numReviews: 32,
    },
    {
        name: "Carrera Calibre 5",
        brand: "TAG Heuer",
        description: "A classic yet contemporary sports watch inspired by Motor Racing. This watch features a polished steel case and a beautiful blue dial.",
        price: 2800.00,
        category: "Sport",
        gender: "MEN",
        image: "https://images.unsplash.com/photo-1547996160-81dfa63595dd?w=800&q=80",
        stock: 15,
        rating: 4.7,
        numReviews: 28,
    },
    {
        name: "G-Shock GA-2100",
        brand: "Casio",
        description: "The slim, octagonal shape that was also used in the original DW-5000C. This digital-analog combination model inherits the concept of the first-generation models.",
        price: 99.00,
        category: "Sport",
        gender: "UNISEX",
        image: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80",
        stock: 50,
        rating: 4.6,
        numReviews: 120,
    },
    // WOMEN'S WATCHES
    {
        name: "Tank Solo",
        brand: "Cartier",
        description: "The modest, modern design of the Tank Solo watch made it a classic from the moment it first appeared in the collection. The Tank Solo honors the unique aesthetic that lies behind the collection's success.",
        price: 3500.00,
        category: "Classic",
        gender: "WOMEN",
        image: "https://images.unsplash.com/photo-1508685096489-7aac29a8a244?w=800&q=80",
        stock: 8,
        rating: 4.8,
        numReviews: 15,
    },
    {
        name: "Constellation Co-Axial",
        brand: "Omega",
        description: "The especially dramatic and enduring design concept of the OMEGA Constellation line is characterized by its famous 'Griffes', or claws, and striking dials.",
        price: 4900.00,
        category: "Luxury",
        gender: "WOMEN",
        image: "https://images.unsplash.com/photo-1523170335258-f5ed11644a13?w=800&q=80",
        stock: 6,
        rating: 4.9,
        numReviews: 22,
    },
    {
        name: "Classic Petite Melrose",
        brand: "Daniel Wellington",
        description: "The Classic Petite Melrose features a white dial and an undeniably elegant rose gold mesh strap. This watch elevates your everyday outfit, your mood and your spirit.",
        price: 189.00,
        category: "Minimalist",
        gender: "WOMEN",
        image: "https://images.unsplash.com/photo-1526333632117-5fef5f12e7c2?w=800&q=80",
        stock: 25,
        rating: 4.5,
        numReviews: 85,
    },
    {
        name: "Modern Park",
        brand: "Coach",
        description: "Clean and minimalist design with a genuine leather strap and a rectangular case. A sophisticated addition to any outfit.",
        price: 150.00,
        category: "Classic",
        gender: "WOMEN",
        image: "https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=800&q=80",
        stock: 20,
        rating: 4.4,
        numReviews: 50,
    },
    // UNISEX
    {
        name: "Apple Watch Series 9",
        brand: "Apple",
        description: "Smartest, most powerful Apple Watch yet. A magical new way to use your watch without touching the screen. A display that's twice as bright.",
        price: 399.00,
        category: "Smart",
        gender: "UNISEX",
        image: "https://images.unsplash.com/photo-1544117518-30dd5ff7a4b0?w=800&q=80",
        stock: 30,
        rating: 4.8,
        numReviews: 240,
    },
    {
        name: "Heritage Visodate",
        brand: "Tissot",
        description: "In the 1950s, Tissot celebrated its 100th anniversary with a series of innovations – one of which was the integration of a date function to the automatic mechanism in a watch called Visodate.",
        price: 650.00,
        category: "Classic",
        gender: "UNISEX",
        image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80",
        stock: 12,
        rating: 4.6,
        numReviews: 40,
    }
];

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
