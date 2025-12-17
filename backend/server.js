require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const adminNotificationRoutes = require("./routes/adminNotificationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

/* =========================
   CORS CONFIGURATION
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://transports-waala.netlify.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman support

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());

/* =========================
   DATABASE
========================= */
connectDB();

/* =========================
   ROUTES
========================= */
app.use("/api/users", userRoutes);
app.use("/api/admin-notifications", adminNotificationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/bookings", bookingRoutes);

/* =========================
   START SERVER
========================= */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
