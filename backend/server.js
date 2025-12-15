const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

dotenv.config();
connectDB();

const app = express();

// 🔥 MUST HAVE middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/notifications", notificationRoutes);

// health check (optional but useful)
app.get("/", (req, res) => {
  res.send("Transport API is running 🚀");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
