const router = require("express").Router();
const {
  getAdminNotifications,
  createAdminNotification,
  markAdminRead
} = require("../controllers/adminNotificationController");

router.get("/", getAdminNotifications);
router.post("/", createAdminNotification);
router.put("/:id/read", markAdminRead);

module.exports = router;
