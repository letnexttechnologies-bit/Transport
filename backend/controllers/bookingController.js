const Booking = require("../models/Booking");

// CREATE
exports.createBooking = async (req, res) => {
  const booking = new Booking(req.body);
  await booking.save();
  res.status(201).json(booking);
};

// READ
exports.getBookings = async (req, res) => {
  const bookings = await Booking.find().sort({ bookedAt: -1 });
  res.json(bookings);
};

// UPDATE STATUS
exports.updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  res.json(booking);
};

// DELETE
exports.deleteBooking = async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
