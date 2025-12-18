// Booking.js
import mongoose from "mongoose";

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

const Booking = mongoose.model("Booking", BookingSchema);

export default Booking; // ✅ default export for ESM
