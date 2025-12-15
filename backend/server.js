require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminNotificationRoutes = require("./routes/adminNotificationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(cors());
app.use(express.json());

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin-notifications", adminNotificationRoutes);
app.use("/api/notifications", notificationRoutes);

/* =========================
   START SERVER
========================= */
connectDB();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
