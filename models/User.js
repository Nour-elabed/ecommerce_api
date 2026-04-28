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

const User = mongoose.model("User", userSchema);
export default User;