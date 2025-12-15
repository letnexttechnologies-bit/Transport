const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
  {
    vehicleType: { type: String, required: true },
    status: {
      type: String,
      enum: ["Scheduled", "At Warehouse", "In Transit", "Delivered", "Cancelled"],
      default: "Scheduled"
    },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    eta: String,
    load: String,
    weight: String,
    truck: String,
    container: String,
    priority: { type: Boolean, default: false },
    image: String,

    // 🔴 IMPORTANT FIX
    userId: {
      type: String,   // ❗ NOT ObjectId (because frontend sends "admin")
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipment", shipmentSchema);
