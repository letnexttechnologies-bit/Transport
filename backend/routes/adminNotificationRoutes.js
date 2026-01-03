import express from 'express';
import {
  getAdminNotifications,
  getAdminNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteAdminNotification,
  getUnreadCount,
  deleteAllAdminNotifications,
} from '../controllers/adminNotificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/unread/count', protect, admin, getUnreadCount);
router.get('/', protect, admin, getAdminNotifications);
router.get('/:id', protect, admin, getAdminNotificationById);
router.put('/:id/read', protect, admin, markNotificationAsRead);
router.put('/read-all', protect, admin, markAllNotificationsAsRead);
router.delete('/all', protect, admin, deleteAllAdminNotifications);
router.delete('/:id', protect, admin, deleteAdminNotification);

export default router;

