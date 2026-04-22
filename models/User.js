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

const User = mongoose.model("User", userSchema);
export default User;