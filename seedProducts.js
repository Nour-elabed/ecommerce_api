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
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
        stock: 15,
        rating: 4.7,
        numReviews: 124,
    },
    {
        name: "Sport Men's Diver Watch",
        description: "Professional men's dive watch with 200m water resistance, unidirectional bezel, and luminous hands. Built for adventure.",
        price: 449.99,
        category: "MEN",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
        stock: 8,
        rating: 4.8,
        numReviews: 89,
    },
    {
        name: "Minimalist Men's Watch",
        description: "Clean and minimalist men's watch design with Japanese movement, mesh strap, and date function. Modern sophistication.",
        price: 189.99,
        category: "MEN",
        image: "https://images.unsplash.com/photo-1548178397-51c5e071d4d7?w=400&h=400&fit=crop",
        stock: 22,
        rating: 4.6,
        numReviews: 156,
    },
    {
        name: "Luxury Men's Automatic",
        description: "Premium men's automatic watch with exhibition case back, blue hands, and alligator leather strap. Swiss movement.",
        price: 899.99,
        category: "MEN",
        image: "https://images.unsplash.com/photo-1515376793567-4a2e4b5b4b5a?w=400&h=400&fit=crop",
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
        image: "https://images.unsplash.com/photo-1495555960110-a6d16f6890e2?w=400&h=400&fit=crop",
        stock: 18,
        rating: 4.8,
        numReviews: 203,
    },
    {
        name: "Women's Fashion Watch",
        description: "Trendy women's watch with crystal-studded bezel, pink dial, and silicone strap. Water resistant and stylish.",
        price: 149.99,
        category: "WOMEN",
        image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50bd?w=400&h=400&fit=crop",
        stock: 31,
        rating: 4.5,
        numReviews: 178,
    },
    {
        name: "Classic Women's Timepiece",
        description: "Timeless women's watch with Roman numerals, two-tone case, and expandable bracelet. Versatile elegance.",
        price: 329.99,
        category: "WOMEN",
        image: "https://images.unsplash.com/photo-1523170335258-f5ed11644a13?w=400&h=400&fit=crop",
        stock: 12,
        rating: 4.7,
        numReviews: 94,
    },
    {
        name: "Sport Women's Watch",
        description: "Active women's sports watch with stopwatch function, durable case, and comfortable rubber strap. Built for performance.",
        price: 199.99,
        category: "WOMEN",
        image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop",
        stock: 25,
        rating: 4.6,
        numReviews: 142,
    }
];

const seedProducts = async () => {
    try {
        await connectDB();
        
        // Clear existing products
        await Product.deleteMany({});
        
        // Insert new products
        await Product.insertMany(products);
        
        console.log(`✅ Successfully seeded ${products.length} products`);
        console.log('📊 Categories:', {
            'MEN': products.filter(p => p.category === 'MEN').length,
            'WOMEN': products.filter(p => p.category === 'WOMEN').length
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedProducts();
}

export default seedProducts;
