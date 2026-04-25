import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { DEFAULT_USER_ROLE, ROLES } from "../constants/roles.js";

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: Object.values(ROLES),
            default: DEFAULT_USER_ROLE,
        },
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

// Pre-save middleware to enforce role constraints
userSchema.pre("save", async function(next) {
    // Check if this is a new user being created as ADMIN
    if (this.isNew && this.role === ROLES.ADMIN) {
        const error = new Error("Users cannot register as ADMIN. ADMIN role can only be assigned by SUPER_ADMIN.");
        return next(error);
    }
    
    // Prevent multiple SUPER_ADMINs
    if (this.isModified("role") && this.role === ROLES.SUPER_ADMIN) {
        const existingSuperAdmin = await this.constructor.findOne({ role: ROLES.SUPER_ADMIN });
        if (existingSuperAdmin && (!this._id || existingSuperAdmin._id.toString() !== this._id.toString())) {
            const error = new Error("Only one SUPER_ADMIN can exist in the system.");
            return next(error);
        }
    }
    
    next();
});

const User = mongoose.model("User", userSchema);
export default User;