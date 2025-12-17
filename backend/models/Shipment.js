const mongoose = require("mongoose");

const ShipmentSchema = new mongoose.Schema({
  shipmentId: { type: String, unique: true },
  vehicleType: String,
  status: String,
  origin: String,
  destination: String,
  eta: String,
  load: String,
  truck: String,
  container: String,
  weight: String,
  priority: Boolean,
  image: String,
  driver: {
    name: String,
    phone: String,
    license: String,
    vehicle: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Shipment", ShipmentSchema);
