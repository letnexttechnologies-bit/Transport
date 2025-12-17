const express = require("express");
const AdminNotification = require("../models/AdminNotification");

const router = express.Router();

/* =========================
   GET ALL ADMIN NOTIFICATIONS
========================= */
router.get("/", async (req, res) => {
  try {
    const notifications = await AdminNotification
      .find()
      .sort({ timestamp: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   MARK AS READ
========================= */
router.put("/:id/read", async (req, res) => {
  try {
    await AdminNotification.findByIdAndUpdate(req.params.id, {
      read: true
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   CLEAR ALL
========================= */
router.delete("/clear", async (req, res) => {
  try {
    await AdminNotification.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
