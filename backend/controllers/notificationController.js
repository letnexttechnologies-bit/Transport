const Notification = require("../models/Notification");

// CREATE NOTIFICATION
exports.createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET USER / ADMIN NOTIFICATIONS
exports.getNotifications = async (req, res) => {
  try {
    const { userId, role } = req.query;

    const notifications = await Notification.find({ userId, role })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// MARK AS READ
exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// CLEAR ALL
exports.clearAll = async (req, res) => {
  const { userId, role } = req.query;
  await Notification.deleteMany({ userId, role });
  res.json({ success: true });
};
