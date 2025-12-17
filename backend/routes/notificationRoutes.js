const express = require("express");
const router = express.Router();
const controller = require("../controllers/notificationController");

router.post("/", controller.createNotification);
router.get("/", controller.getNotifications);
router.put("/:id/read", controller.markAsRead);
router.delete("/", controller.clearAll);

module.exports = router;
