const express = require("express");
const router = express.Router();
const multer = require("multer");
const Shipment = require("../models/Shipment");

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const shipment = await Shipment.create({
      ...req.body,
      image: req.file ? req.file.path : null,
    });
    res.json({ success: true, shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/", async (req, res) => {
  const shipments = await Shipment.find();
  res.json({ success: true, shipments });
});

module.exports = router;
