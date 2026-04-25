import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import Product from "./models/Product.js";

const products = [
    // ─── MEN'S LUXURY & CLASSIC ──────────────────────────────────────
    {
        name: "Day-Date 40 'President'",
        brand: "Rolex",
        description: "The Rolex Day-Date is the ultimate watch of prestige. The 40mm case in 18ct yellow gold features the iconic President bracelet and a champagne dial.",
        price: 36500.00,
        category: "Luxury",
        gender: "MEN",
        image: "https://images.unsplash.com/photo-1523170335258-f5ed11644a13?auto=format&fit=crop&q=80&w=800",
        stock: 3,
        rating: 4.9,
        numReviews: 120,
    },
    {
        name: "Nautilus 5711",
        brand: "Patek Philippe",
        description: "With the rounded octagonal shape of its bezel, the ingenious porthole construction of its case, and its horizontally embossed dial, the Nautilus has exemplified the elegant sports watch since 1976.",
        price: 125000.00,
        category: "Luxury",
        gender: "MEN",
        image: "https://images.unsplash.com/photo-1547996160-81dfa63595dd?auto=format&fit=crop&q=80&w=800",
        stock: 1,
        rating: 5.0,
        numReviews: 45,
    },
    {
        name: "Heritage Chronometer",
        brand: "Grand Seiko",
        description: "A pinnacle of precision and craftsmanship. This Spring Drive model features the 'Snowflake' dial inspired by the snow on the mountains surrounding the Shinshu Watch Studio.",
        price: 5800.00,
        category: "Classic",
        gender: "MEN",
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800",
        stock: 7,
        rating: 4.8,
        numReviews: 89,
    },
    // ─── WOMEN'S ELEGANCE ──────────────────────────────────────────
    {
        name: "Panthère de Cartier",
        brand: "Cartier",
        description: "A watch that is also a piece of jewelry, the Panthère de Cartier is one of the most distinctive Cartier designs. Born in the 80s and more contemporary than ever.",
        price: 24800.00,
        category: "Luxury",
        gender: "WOMEN",
        image: "https://images.unsplash.com/photo-1508685096489-7aac29a8a244?auto=format&fit=crop&q=80&w=800",
        stock: 4,
        rating: 4.9,
        numReviews: 62,
    },
    {
        name: "Lady-Datejust Floral",
        brand: "Rolex",
        description: "The Lady-Datejust concentrated in its 28mm case all the attributes of the Datejust. This version features a stunning floral-motif dial and diamond-set bezel.",
        price: 14200.00,
        category: "Luxury",
        gender: "WOMEN",
        image: "https://images.unsplash.com/photo-1509048191080-d2984bad6ad5?auto=format&fit=crop&q=80&w=800",
        stock: 5,
        rating: 4.8,
        numReviews: 74,
    },
    {
        name: "Serpenti Seduttori",
        brand: "Bvlgari",
        description: "Gleaming with the refined sheen of its materials, the Serpenti Seduttori watch makes time even more precious. Reimagining Bvlgari's icon of seduction with a new design.",
        price: 18900.00,
        category: "Classic",
        gender: "WOMEN",
        image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&q=80&w=800",
        stock: 6,
        rating: 4.7,
        numReviews: 53,
    },
    // ─── SPORT & ADVENTURE ─────────────────────────────────────────
    {
        name: "Royal Oak Offshore",
        brand: "Audemars Piguet",
        description: "The Offshore collection has defied established conventions since 1993, giving an ever more powerful and sporty take on the Royal Oak design.",
        price: 32000.00,
        category: "Sport",
        gender: "MEN",
        image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=800",
        stock: 3,
        rating: 4.9,
        numReviews: 110,
    },
    {
        name: "Black Bay Fifty-Eight",
        brand: "Tudor",
        description: "A tribute to the brand's first divers' watches with a 39mm case. The Fifty-Eight is fit for slim wrists and people who like vintage style.",
        price: 3950.00,
        category: "Sport",
        gender: "UNISEX",
        image: "https://images.unsplash.com/photo-1548178397-51c5e071d4d7?auto=format&fit=crop&q=80&w=800",
        stock: 12,
        rating: 4.8,
        numReviews: 156,
    },
    // ─── MINIMALIST & MODERN ───────────────────────────────────────
    {
        name: "Max Bill Automatic",
        brand: "Junghans",
        description: "Bauhaus design at its purest. The Max Bill collection is characterized by a minimalist dial and a subtly curved case.",
        price: 1250.00,
        category: "Minimalist",
        gender: "UNISEX",
        image: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&q=80&w=800",
        stock: 15,
        rating: 4.6,
        numReviews: 88,
    },
    {
        name: "Nomos Tangente 38",
        brand: "Nomos Glashütte",
        description: "The prize-winning classic from Nomos. Straight lines, right angles, and a clear vision. The epitome of Glashütte craftsmanship.",
        price: 2300.00,
        category: "Minimalist",
        gender: "UNISEX",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
        stock: 10,
        rating: 4.7,
        numReviews: 64,
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
