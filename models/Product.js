import mongoose from "mongoose";

const productSchema = mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
        },
        name: {
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
            enum: ["Electronics", "Clothing", "Accessories", "Home", "Sports", "Beauty"],
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

productSchema.pre("validate", function syncTitleAndName(next) {
    if (!this.name && this.title) this.name = this.title;
    if (!this.title && this.name) this.title = this.name;
    next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
