import AdminNotification from '../models/AdminNotification.js';

// @desc    Get all admin notifications
// @route   GET /api/admin/notifications
// @access  Private/Admin
export const getAdminNotifications = async (req, res) => {
  try {
    const { read, type } = req.query;
    const query = {};

    if (read !== undefined) {
      query.read = read === 'true';
    }
    if (type) {
      query.type = type;
    }

    const notifications = await AdminNotification.find(query)
      .populate('relatedId')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single admin notification
// @route   GET /api/admin/notifications/:id
// @access  Private/Admin
export const getAdminNotificationById = async (req, res) => {
  try {
    const notification = await AdminNotification.findById(req.params.id).populate('relatedId');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/admin/notifications/:id/read
// @access  Private/Admin
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await AdminNotification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/admin/notifications/read-all
// @access  Private/Admin
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await AdminNotification.updateMany({ read: false }, { read: true });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/admin/notifications/:id
// @access  Private/Admin
export const deleteAdminNotification = async (req, res) => {
  try {
    const notification = await AdminNotification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.deleteOne();

    res.json({ message: 'Notification removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unread count
// @route   GET /api/admin/notifications/unread/count
// @access  Private/Admin
export const getUnreadCount = async (req, res) => {
  try {
    const count = await AdminNotification.countDocuments({ read: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete all admin notifications
// @route   DELETE /api/admin/notifications
// @access  Private/Admin
export const deleteAllAdminNotifications = async (req, res) => {
  try {
    await AdminNotification.deleteMany({});
    res.json({ message: 'All notifications deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

