import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// routes
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import shipmentRoutes from "./routes/shipmentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();
connectDB();

const app = express();

// 🔥 REQUIRED middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 ROUTES (this is where many people miss)
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
