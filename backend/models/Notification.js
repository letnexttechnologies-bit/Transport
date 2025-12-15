const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },   // admin or userId
    role: { type: String, enum: ["admin", "user"], required: true },

    title: { type: String },
    message: { type: String, required: true },

    type: {
      type: String,
      enum: ["info", "success", "warning", "error", "booking"],
      default: "info"
    },

    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
