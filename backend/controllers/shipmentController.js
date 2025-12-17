const Shipment = require("../models/Shipment");

// CREATE
exports.createShipment = async (req, res) => {
  try {
    const shipment = new Shipment(req.body);
    await shipment.save();
    res.status(201).json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ
exports.getShipments = async (req, res) => {
  const shipments = await Shipment.find().sort({ createdAt: -1 });
  res.json(shipments);
};

// DELETE
exports.deleteShipment = async (req, res) => {
  await Shipment.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
