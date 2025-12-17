const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  bookingId: String,
  userName: String,
  userPhone: String,
  shipmentDetails: Object,
  status: {
    type: String,
    default: "Pending"
  },
  bookedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Booking", BookingSchema);
