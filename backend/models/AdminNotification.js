// models/AdminNotification.js
import mongoose from "mongoose";

const adminNotificationSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  message: String,
  type: String,
  read: { type: Boolean, default: false },
  shipmentId: String,
  bookingId: String,
  timestamp: { type: Date, default: Date.now }
});

const AdminNotification = mongoose.model("AdminNotification", adminNotificationSchema);
export default AdminNotification;
