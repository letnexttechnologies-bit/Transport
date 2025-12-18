// Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // admin or userId
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

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification; // ✅ default export for ESM
