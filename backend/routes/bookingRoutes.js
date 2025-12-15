const express = require("express");
const Booking = require("../models/Booking");
const router = express.Router();

router.post("/", async (req, res) => {
  const booking = await Booking.create(req.body);
  res.json({ success: true, booking });
});

router.get("/", async (req, res) => {
  const bookings = await Booking.find();
  res.json({ success: true, bookings });
});

module.exports = router;
