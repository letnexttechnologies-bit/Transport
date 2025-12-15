const express = require("express");
const User = require("../models/User");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  const user = await User.findOne({ phone, password });
  if (!user) return res.status(404).json({ success: false, message: "Invalid credentials" });

  res.json({ success: true, user });
});

module.exports = router;
