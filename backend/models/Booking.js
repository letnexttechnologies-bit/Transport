const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  shipmentId: String,
  userId: String,
  userName: String,
  userPhone: String,
  status: { type: String, default: "Pending" },
  bookedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", bookingSchema);
