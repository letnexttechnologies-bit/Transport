import Shipment from '../models/Shipment.js';
import Booking from '../models/Booking.js';

// @desc    Get detailed shipment information
// @route   GET /api/shipments/:id/details
// @access  Public
export const getShipmentDetails = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate('createdBy', 'name phone vehicleNumber');

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    // Get related bookings
    const bookings = await Booking.find({ shipmentId: req.params.id })
      .populate('userId', 'name phone vehicleNumber')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter((b) => b.status === 'Pending').length,
      approvedBookings: bookings.filter((b) => b.status === 'Approved').length,
    };

    res.json({
      shipment,
      bookings,
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get shipment tracking information
// @route   GET /api/shipments/:id/tracking
// @access  Public
export const getShipmentTracking = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate('createdBy', 'name phone vehicleNumber');

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    // Get approved booking for this shipment
    const booking = await Booking.findOne({
      shipmentId: req.params.id,
      status: 'Approved',
    }).populate('userId', 'name phone vehicleNumber');

    // Mock tracking data (in real app, this would come from GPS/telemetry)
    const trackingData = {
      currentLocation: shipment.coordinates?.origin || null,
      estimatedArrival: shipment.date,
      status: shipment.status,
      driver: shipment.driver || null,
      route: {
        origin: shipment.origin,
        destination: shipment.destination,
        coordinates: shipment.coordinates,
      },
      updates: [
        {
          time: shipment.createdAt,
          location: shipment.origin,
          status: 'Departed',
        },
        {
          time: new Date(),
          location: 'In Transit',
          status: shipment.status,
        },
      ],
    };

    res.json({
      shipment,
      booking,
      tracking: trackingData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



