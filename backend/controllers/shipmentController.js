import Shipment from "../models/Shipment.js";

// GET all shipments
export const getAllShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 });
    res.status(200).json(shipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET shipment by ID
export const getShipmentById = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }
    res.status(200).json(shipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE shipment
export const updateShipment = async (req, res) => {
  try {
    const updatedShipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedShipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    res.status(200).json(updatedShipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE shipment
export const deleteShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findByIdAndDelete(req.params.id);

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    res.status(200).json({ message: "Shipment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
