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

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save middleware to hash password and enforce role constraints
userSchema.pre("save", async function(next) {
    try {
        if (this.isModified("password")) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }

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
    } catch (error) {
        return next(error);
    }
});

const User = mongoose.model("User", userSchema);
export default User;