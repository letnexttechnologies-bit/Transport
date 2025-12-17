const express = require("express");
const router = express.Router();
const controller = require("../controllers/shipmentController");

router.post("/", controller.createShipment);
router.get("/", controller.getShipments);
router.delete("/:id", controller.deleteShipment);

module.exports = router;
