const mongoose = require("mongoose");

const adminNotificationSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    type: { type: String, default: "info" },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminNotification", adminNotificationSchema);
