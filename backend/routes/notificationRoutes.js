const express = require("express");
const Notification = require("../models/Notification");
const router = express.Router();

router.get("/:userId", async (req, res) => {
  const notifications = await Notification.find({
    $or: [{ userId: req.params.userId }, { forAllUsers: true }],
  });

  res.json({ success: true, notifications });
});

module.exports = router;
