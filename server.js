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
import adminRoutes from "./routes/admin.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const app = express();

// ─── Security Middleware ──────────────────────────────────────────
app.use(helmet()); // Sets secure HTTP response headers

app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
    })
);

// ─── Rate Limiting ────────────────────────────────────────────────
// Max 100 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// ─── Request Logging ──────────────────────────────────────────────
// Logs: METHOD URL STATUS RESPONSE_TIME - Content-Length
app.use(morgan("dev"));

// ─── Body Parsing ─────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────
app.use("/api/users", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// ─── Global Error Handler (must be last!) ─────────────────────────
app.use(errorHandler);

// ─── Database + Server ────────────────────────────────────────────
connectDB();
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🌍 Accepting requests from: ${CLIENT_URL}`); // client_url
});