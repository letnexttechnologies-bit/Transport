const express = require("express");
const User = require("../models/User");
const router = express.Router();

router.get("/", async (req, res) => {
  const users = await User.find({}, "-password");
  res.json({ success: true, users });
});

module.exports = router;
