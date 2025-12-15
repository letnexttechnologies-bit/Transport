const Shipment = require("../models/Shipment");

// CREATE SHIPMENT
exports.createShipment = async (req, res) => {
  try {
    console.log("Incoming shipment:", req.body);

    const shipment = new Shipment(req.body);
    const saved = await shipment.save();

    res.status(201).json({
      success: true,
      data: saved
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// GET ALL SHIPMENTS
exports.getShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: shipments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE STATUS
exports.updateShipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await Shipment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
