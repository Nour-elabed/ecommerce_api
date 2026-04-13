import { connectDB } from "./config/db.js";
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

// ─── Allowed Origins (FIXED CORS) ───────────────────────────────
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://watchhaven.vercel.app"
];

// ─── Security Middleware ─────────────────────────────────────────
app.use(helmet());

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

// ─── Rate Limiting ───────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// ─── Logging ─────────────────────────────────────────────────────
app.use(morgan("dev"));

// ─── Body Parsing ─────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────
app.use("/api/users", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// ─── Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

// ─── DB + Server ──────────────────────────────────────────────────
connectDB();

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});