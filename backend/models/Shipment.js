const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({
  vehicleType: String,
  status: { type: String, default: "At Warehouse" },
  origin: String,
  destination: String,
  eta: String,
  load: String,
  weight: String,
  truck: String,
  container: String,
  priority: Boolean,
  userId: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model("Shipment", shipmentSchema);
