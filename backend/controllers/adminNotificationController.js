const AdminNotification = require("../models/AdminNotification");

/* GET ADMIN NOTIFICATIONS */
exports.getAdminNotifications = async (req, res) => {
  const notes = await AdminNotification.find().sort({ createdAt: -1 });
  res.json(notes);
};

/* CREATE ADMIN NOTIFICATION */
exports.createAdminNotification = async (req, res) => {
  const note = await AdminNotification.create(req.body);
  res.status(201).json(note);
};

/* MARK ADMIN READ */
exports.markAdminRead = async (req, res) => {
  await AdminNotification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ message: "Admin notification read" });
};
