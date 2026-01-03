import UserNotification from '../models/UserNotification.js';
import { emitUserNotification } from '../socket.js';

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
export const getUserNotifications = async (req, res) => {
  try {
    const { read, type } = req.query;
    const query = { userId: req.user._id };

    if (read !== undefined) {
      query.read = read === 'true';
    }
    if (type) {
      query.type = type;
    }

    const notifications = await UserNotification.find(query)
      .populate('relatedId')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user notification
// @route   GET /api/users/notifications/:id
// @access  Private
export const getUserNotificationById = async (req, res) => {
  try {
    const notification = await UserNotification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('relatedId');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await UserNotification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

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
// @route   PUT /api/users/notifications/read-all
// @access  Private
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await UserNotification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/users/notifications/:id
// @access  Private
export const deleteUserNotification = async (req, res) => {
  try {
    const notification = await UserNotification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

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
// @route   GET /api/users/notifications/unread/count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const count = await UserNotification.countDocuments({
      userId: req.user._id,
      read: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete all notifications
// @route   DELETE /api/users/notifications
// @access  Private
export const deleteAllUserNotifications = async (req, res) => {
  try {
    await UserNotification.deleteMany({ userId: req.user._id });
    res.json({ message: 'All notifications deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create user notification
// @route   POST /api/users/notifications
// @access  Private
export const createUserNotification = async (req, res) => {
  try {
    const {
      type,
      title,
      message,
      msgKey,
      params,
      relatedId,
      relatedModel,
      priority,
      notificationType,
    } = req.body;

    const notification = await UserNotification.create({
      userId: req.user._id,
      type: type || 'system',
      title: title || 'Notification',
      message: message || '',
      msgKey: msgKey || null,
      params: params || {},
      relatedId: relatedId || null,
      relatedModel: relatedModel || null,
      priority: priority || 'medium',
      notificationType: notificationType || 'info',
    });

    // Emit notification via socket for real-time updates
    try {
      const userIdStr = req.user._id.toString();
      console.log(`Emitting notification to user: ${userIdStr}`);
      console.log('Notification data:', {
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        msgKey: notification.msgKey,
        params: notification.params
      });
      emitUserNotification(userIdStr, notification);
    } catch (socketError) {
      console.error('Error emitting user notification:', socketError);
      // Don't fail the request if socket fails
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

