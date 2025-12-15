const express = require("express");
const Booking = require("../models/Booking");
const AdminNotification = require("../models/AdminNotification");

const router = express.Router();

/* =========================
   CREATE BOOKING (USER)
========================= */
router.post("/", async (req, res) => {
  try {
    const booking = await Booking.create(req.body);

    // Notify admin
    await AdminNotification.create({
      userId: booking.userId,
      userName: booking.userName,
      bookingId: booking._id,
      shipmentId: booking.shipmentId,
      type: "booking_request",
      message: `New booking request for shipment ${booking.shipmentId}`
    });

    res.status(201).json({
      message: "Booking request sent successfully",
      booking
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

/* =========================
   GET ALL BOOKINGS (ADMIN)
========================= */
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ bookedAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

/* =========================
   GET BOOKINGS BY USER
========================= */
router.get("/user/:userId", async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId })
      .sort({ bookedAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

/* =========================
   GET BOOKING BY ID
========================= */
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

/* =========================
   UPDATE BOOKING STATUS (ADMIN)
========================= */
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    // Notify user via admin notifications
    await AdminNotification.create({
      userId: booking.userId,
      userName: booking.userName,
      bookingId: booking._id,
      shipmentId: booking.shipmentId,
      type: "booking_status_update",
      message: `Booking ${booking._id} status updated to ${status}`
    });

    res.json({
      message: "Booking status updated",
      booking
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

/* =========================
   CANCEL BOOKING (USER)
========================= */
router.patch("/:id/cancel", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "Cancelled" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    await AdminNotification.create({
      userId: booking.userId,
      userName: booking.userName,
      bookingId: booking._id,
      shipmentId: booking.shipmentId,
      type: "booking_cancelled",
      message: `Booking ${booking._id} has been cancelled by user`
    });

    res.json({
      message: "Booking cancelled successfully",
      booking
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

/* =========================
   DELETE BOOKING (ADMIN)
========================= */
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    res.json({
      message: "Booking deleted"
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

module.exports = router;
