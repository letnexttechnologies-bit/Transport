// notificationRoutes.js
import express from "express";
import * as controller from "../controllers/notificationController.js"; // use .js extension
import { protect, adminOnly } from "../middleware/authMiddleware.js"; // use .js extension

const router = express.Router();

router.post("/", protect, adminOnly, controller.createNotification);
router.get("/", protect, adminOnly, controller.getNotifications);
router.put("/:id", protect, adminOnly, controller.updateNotification);
router.delete("/:id", protect, adminOnly, controller.deleteNotification);

export default router;
