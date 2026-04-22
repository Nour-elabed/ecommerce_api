import mongoose from "mongoose";

const orderItemSchema = mongoose.Schema({
    product: {
        type: String, // product id (string for static or ObjectId)
        required: true,
    },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        orderItems: [orderItemSchema],
        shippingAddress: {
            fullName: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        paymentMethod: {
            type: String,
            required: true,
            enum: ["Cash on Delivery", "Card", "PayPal"],
            default: "Cash on Delivery",
        },
        status: {
            type: String,
            enum: ["pending", "shipped", "delivered", "canceled"],
            default: "pending",
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        // NOTE: In production, isPaid should be set after real payment confirmation.
        // For now we simulate immediate payment on "Card" or "PayPal" selection.
        isPaid: {
            type: Boolean,
            default: false,
        },
        paidAt: { type: Date },
        isDelivered: {
            type: Boolean,
            default: false,
        },
        deliveredAt: { type: Date },
    },
    { timestamps: true }
);

orderSchema.pre("save", function syncDeliveryFromStatus(next) {
    if (this.status === "delivered") {
        this.isDelivered = true;
        this.deliveredAt = this.deliveredAt || new Date();
    } else if (this.status !== "delivered") {
        this.isDelivered = false;
        this.deliveredAt = undefined;
    }
    next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
