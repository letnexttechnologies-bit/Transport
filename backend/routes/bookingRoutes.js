// bookingRoutes.js
import express from "express";
import * as controller from "../controllers/bookingController.js"; // .js extension required
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, controller.createBooking);
router.get("/", protect, adminOnly, controller.getBookings);
router.put("/:id", protect, controller.updateBookingStatus);
router.delete("/:id", protect, adminOnly, controller.deleteBooking);

export default router;
