const express = require("express");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

/* GET ALL USERS (ADMIN) */
router.get("/", protect, adminOnly, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

/* GET USER BY ID */
router.get("/:id", protect, async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

/* UPDATE USER */
router.put("/:id", protect, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).select("-password");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ message: "User updated", user });
});

/* DELETE USER (ADMIN) */
router.delete("/:id", protect, adminOnly, async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted" });
});

module.exports = router;
