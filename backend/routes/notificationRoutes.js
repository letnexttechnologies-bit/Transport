const router = require("express").Router();
const {
  getUserNotifications,
  createUserNotification,
  markAsRead
} = require("../controllers/notificationController");

router.get("/:userId", getUserNotifications);
router.post("/", createUserNotification);
router.put("/:id/read", markAsRead);

module.exports = router;
