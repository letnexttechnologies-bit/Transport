const mongoose = require("mongoose");

const adminNotificationSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  message: String,
  type: String,
  read: { type: Boolean, default: false },
  shipmentId: String,
  bookingId: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AdminNotification", adminNotificationSchema);
