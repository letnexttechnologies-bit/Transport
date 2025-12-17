const Notification = require("../models/Notification");

/* GET USER NOTIFICATIONS */
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/* CREATE USER NOTIFICATION */
exports.createUserNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: "Notification creation failed" });
  }
};

/* MARK AS READ */
exports.markAsRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ message: "Marked as read" });
};
