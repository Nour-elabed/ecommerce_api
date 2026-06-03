import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { DEFAULT_USER_ROLE, ROLES } from "../constants/roles.js";

const userSchema = mongoose.Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: Object.values(ROLES),
            default: DEFAULT_USER_ROLE,
        },
        balance: { type: Number, default: 0, min: 0 },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

userSchema.virtual("isAdmin").get(function getIsAdmin() {
    return this.role === ROLES.ADMIN || this.role === ROLES.SUPER_ADMIN;
});

userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function preSave() {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    // Block creating new accounts with elevated roles unless explicitly bypassed (seeder).
    if (this.isNew && !this.__skipRoleGuard && this.role !== ROLES.USER) {
        throw new Error("New accounts must use the USER role.");
    }
});

// ─── Cascade delete on user removal ──────────────────────────────
// • Cart     → deleted  (belongs only to this user, meaningless without them)
// • Products → deleted  (order items embed name/price/image snapshots, so
//                        existing orders are NOT broken by removing the product)
// • Orders   → kept     (financial records must survive user deletion)
//
// Models are resolved at runtime via mongoose.model() to avoid any top-level
// circular-import issues between the three model files.
userSchema.post("deleteOne", { document: true, query: false }, async function postDelete() {
    const userId = this._id;
    const Cart    = mongoose.model("Cart");
    const Product = mongoose.model("Product");

    await Promise.all([
        Cart.deleteOne({ user: userId }),
        Product.deleteMany({ seller: userId }),
    ]);

    console.log(`[CASCADE] User ${userId} deleted → cart + products removed. Orders retained.`);
});

const User = mongoose.model("User", userSchema);
export default User;