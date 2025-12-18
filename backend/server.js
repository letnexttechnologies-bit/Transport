import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import shipmentRoutes from "./routes/shipmentRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminNotificationRoutes from "./routes/adminNotificationRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://transports-waala.netlify.app",
    // Add your frontend URL if needed
  ],
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Database Connection
connectDB();

// ==================== ROUTES ====================
app.use("/api/auth", authRoutes);           // ← /api/auth/register, /api/auth/login
app.use("/api/users", userRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin-notifications", adminNotificationRoutes);

// Health Check (so root doesn't 404)
app.get("/", (req, res) => {
  res.send("🚛 Transport Waala Backend API is LIVE! 🚀");
});

// 404 fallback
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});