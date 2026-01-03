import express from 'express';
import {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
  getAvailableShipments,
} from '../controllers/shipmentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/available', getAvailableShipments);
router.get('/', getShipments);
router.get('/:id', getShipmentById);
router.post('/', protect, upload.single('image'), createShipment);
router.put('/:id', protect, upload.single('image'), updateShipment);
router.delete('/:id', protect, admin, deleteShipment);

export default router;

