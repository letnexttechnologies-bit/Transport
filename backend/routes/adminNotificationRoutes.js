// adminNotificationRoutes.js
import express from "express";
import * as controller from "../controllers/adminNotificationController.js"; // .js extension required
import { protect, adminOnly } from "../middleware/authMiddleware.js"; // .js extension required

const router = express.Router();

// Only admin can create notifications
router.post("/", protect, adminOnly, controller.createAdminNotification);
router.get("/", protect, adminOnly, controller.getAdminNotifications);
router.put("/:id", protect, adminOnly, controller.updateAdminNotification);
router.delete("/:id", protect, adminOnly, controller.deleteAdminNotification);

export default router;
