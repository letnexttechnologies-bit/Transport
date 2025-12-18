import express from "express";
import {
  getAllShipments,
  getShipmentById,
  updateShipment,
  deleteShipment
} from "../controllers/shipmentController.js";

const router = express.Router();

router.get("/", getAllShipments);
router.get("/:id", getShipmentById);
router.put("/:id", updateShipment);
router.delete("/:id", deleteShipment);

export default router;
