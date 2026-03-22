import mongoose from "mongoose";

// Each item in the cart represents a product snapshot at time of adding.
// Storing name/price/image directly avoids the need to join with a Product
// collection on every cart read and protects against price changes after adding.
const cartItemSchema = new mongoose.Schema(
    {
        productId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        image: {
            type: String,
            default: "",
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },
    },
    { _id: false } // We use productId as the unique identifier inside the array
);

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // one cart document per user
        },
        items: [cartItemSchema],
    },
    { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
