import express from 'express';
import {
  getUserNotifications,
  getUserNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteUserNotification,
  getUnreadCount,
  deleteAllUserNotifications,
  createUserNotification,
} from '../controllers/userNotificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/unread/count', protect, getUnreadCount);
router.get('/', protect, getUserNotifications);
router.post('/', protect, createUserNotification);
router.get('/:id', protect, getUserNotificationById);
router.put('/:id/read', protect, markNotificationAsRead);
router.put('/read-all', protect, markAllNotificationsAsRead);
router.delete('/all', protect, deleteAllUserNotifications);
router.delete('/:id', protect, deleteUserNotification);

export default router;

