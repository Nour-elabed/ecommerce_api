import mongoose from "mongoose";

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        brand: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        category: {
            type: String,
            required: true,
            enum: ["Luxury", "Sport", "Classic", "Smart", "Minimalist"],
            default: "Classic",
        },
        gender: {
            type: String,
            required: true,
            enum: ["MEN", "WOMEN", "UNISEX"],
            default: "UNISEX",
        },
        image: {
            type: String,
            default: "/assets/images/watch.svg",
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
