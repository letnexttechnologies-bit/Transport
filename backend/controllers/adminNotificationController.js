// adminNotificationController.js
import Notification from "../models/Notification.js";

/* CREATE ADMIN NOTIFICATION */
export const createAdminNotification = async (req, res) => {
  try {
    const { userId, role, title, message, type } = req.body;

    if (!role || !message) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const notification = new Notification({
      userId: userId || "admin",
      role,
      title,
      message,
      type: type || "info",
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET ALL ADMIN NOTIFICATIONS */
export const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ role: "admin" }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE ADMIN NOTIFICATION */
export const updateAdminNotification = async (req, res) => {
  try {
    const { title, message, type, read } = req.body;

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { title, message, type, read },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE ADMIN NOTIFICATION */
export const deleteAdminNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
