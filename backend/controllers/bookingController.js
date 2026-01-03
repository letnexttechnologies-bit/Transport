import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Shipment from '../models/Shipment.js';
import AdminNotification from '../models/AdminNotification.js';
import UserNotification from '../models/UserNotification.js';
import { emitShipmentBookingStatus, emitBookingUpdate, emitAdminNotification, emitUserNotification } from '../socket.js';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const { shipmentId } = req.body;

    // Validate shipmentId
    if (!shipmentId) {
      return res.status(400).json({ 
        message: 'Shipment ID is required',
        received: req.body 
      });
    }

    // Log for debugging
    console.log('Creating booking:', { 
      shipmentId, 
      userId: req.user?._id,
      shipmentIdType: typeof shipmentId 
    });

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if shipment exists
    let shipment;
    try {
      shipment = await Shipment.findById(shipmentId);
    } catch (err) {
      console.error('Error finding shipment:', err);
      return res.status(400).json({ message: 'Invalid shipment ID format' });
    }
    
    if (!shipment) {
      return res.status(404).json({ message: `Shipment not found with ID: ${shipmentId}` });
    }

    // Check if shipment is available
    if (['Delivered', 'Cancelled'].includes(shipment.status)) {
      return res.status(400).json({ message: 'Shipment is not available for booking' });
    }

    // Validate ObjectId format - convert to string first if needed
    const shipmentIdStr = String(shipmentId).trim();
    if (!mongoose.Types.ObjectId.isValid(shipmentIdStr)) {
      return res.status(400).json({ 
        message: 'Invalid shipment ID format',
        received: shipmentId,
        type: typeof shipmentId
      });
    }

    const userIdStr = String(req.user._id).trim();
    if (!mongoose.Types.ObjectId.isValid(userIdStr)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format',
        received: req.user._id
      });
    }

    // Convert to ObjectId
    const shipmentObjectId = new mongoose.Types.ObjectId(shipmentIdStr);
    const userObjectId = new mongoose.Types.ObjectId(userIdStr);

    // Check if user already has a booking for this shipment
    const existingUserBooking = await Booking.findOne({
      shipmentId: shipmentObjectId,
      userId: userObjectId,
      status: { $in: ['Pending', 'Approved'] },
    });

    if (existingUserBooking) {
      return res.status(400).json({ message: 'You already have a booking for this shipment' });
    }

    // Check if shipment is already booked by ANY user (first-come, first-served)
    const existingShipmentBooking = await Booking.findOne({
      shipmentId: shipmentObjectId,
      status: { $in: ['Pending', 'Approved'] },
    });

    if (existingShipmentBooking) {
      return res.status(400).json({ 
        message: 'This shipment is already booked by another user',
        bookedBy: existingShipmentBooking.userName || 'Another user'
      });
    }

    // Create booking with proper ObjectId conversion
    // The unique index on shipmentId will prevent double bookings at the database level
    let booking;
    try {
      booking = await Booking.create({
        shipmentId: shipmentObjectId,
        userId: userObjectId,
        userName: req.user.name || 'Unknown User',
        shipmentDetails: {
          origin: shipment.origin,
          destination: shipment.destination,
          vehicleType: shipment.vehicleType,
          load: shipment.load,
          weight: shipment.weight,
          price: shipment.price,
          status: shipment.status,
          image: shipment.image || '',
          vehicleNumber: req.user.vehicleNumber || shipment.driver?.vehicleNumber || '',
        },
        status: 'Pending',
      });
    } catch (createError) {
      // Handle duplicate bookingId error (race condition)
      if (createError.code === 11000 && createError.keyPattern?.bookingId) {
        console.error('Duplicate bookingId error, checking for actual duplicate booking...');
        
        // First check if there's actually a duplicate booking (not just ID collision)
        const existingBooking = await Booking.findOne({
          shipmentId: shipmentObjectId,
          status: { $in: ['Pending', 'Approved'] },
        });
        
        if (existingBooking) {
          // There's an actual duplicate booking, don't retry
          const isCurrentUserBooking = existingBooking.userId.toString() === userObjectId.toString();
          if (isCurrentUserBooking) {
            return res.status(400).json({ 
              message: 'You already have a booking for this shipment',
              error: 'Duplicate booking detected',
              code: 'DUPLICATE_USER_BOOKING'
            });
          } else {
            return res.status(400).json({ 
              message: 'This shipment is already booked by another user',
              error: 'Shipment already has an active booking',
              code: 'DUPLICATE_BOOKING'
            });
          }
        }
        
        // It's just a bookingId collision, retry with timestamp-based ID
        console.log('Retrying with timestamp-based ID...');
        const userInitial = (req.user.name || 'U').charAt(0).toUpperCase();
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const fallbackBookingId = `${userInitial}${String(timestamp).slice(-6)}${String(random).padStart(3, '0')}`;
        
        try {
          booking = await Booking.create({
            shipmentId: shipmentObjectId,
            userId: userObjectId,
            userName: req.user.name || 'Unknown User',
            bookingId: fallbackBookingId,
            shipmentDetails: {
              origin: shipment.origin,
              destination: shipment.destination,
              vehicleType: shipment.vehicleType,
              load: shipment.load,
              weight: shipment.weight,
              price: shipment.price,
              status: shipment.status,
              image: shipment.image || '',
              vehicleNumber: req.user.vehicleNumber || shipment.driver?.vehicleNumber || '',
            },
            status: 'Pending',
          });
        } catch (retryError) {
          // If retry also fails, check again for duplicate booking
          if (retryError.code === 11000) {
            const existingBookingRetry = await Booking.findOne({
              shipmentId: shipmentObjectId,
              status: { $in: ['Pending', 'Approved'] },
            });
            
            if (existingBookingRetry) {
              const isCurrentUserBookingRetry = existingBookingRetry.userId.toString() === userObjectId.toString();
              if (isCurrentUserBookingRetry) {
                return res.status(400).json({ 
                  message: 'You already have a booking for this shipment',
                  error: 'Duplicate booking detected',
                  code: 'DUPLICATE_USER_BOOKING'
                });
              } else {
                return res.status(400).json({ 
                  message: 'This shipment is already booked by another user',
                  error: 'Shipment already has an active booking',
                  code: 'DUPLICATE_BOOKING'
                });
              }
            }
          }
          throw retryError;
        }
      } else {
        throw createError;
      }
    }
    
    // Ensure bookingId is generated (re-fetch if needed)
    if (!booking.bookingId) {
      const updatedBooking = await Booking.findById(booking._id);
      if (updatedBooking && updatedBooking.bookingId) {
        booking.bookingId = updatedBooking.bookingId;
      }
    }

    // Populate booking (handle errors gracefully)
    let populatedBooking;
    try {
      populatedBooking = await Booking.findById(booking._id)
        .populate('shipmentId')
        .populate('userId', 'name phone vehicleNumber');
      
      // Ensure bookingId is set in populated booking
      if (!populatedBooking.bookingId && booking.bookingId) {
        populatedBooking.bookingId = booking.bookingId;
      }
    } catch (populateError) {
      console.error('Error populating booking:', populateError);
      // Return booking without population if populate fails
      populatedBooking = booking;
    }

    // Create admin notification (don't fail if this fails)
    try {
      const bookingIdDisplay = booking.bookingId || booking._id.toString().slice(-6).toUpperCase();
      const adminNotification = await AdminNotification.create({
        type: 'booking',
        title: 'New Booking Request',
        message: `${req.user.name} (${req.user.phone || 'No phone'}) has requested to book shipment ${shipment.origin} to ${shipment.destination}. Booking ID: ${bookingIdDisplay}`,
        msgKey: 'notifications.admin.newBookingRequest',
        params: {
          userName: req.user.name,
          phone: req.user.phone || 'No phone',
          origin: shipment.origin,
          destination: shipment.destination,
          bookingId: bookingIdDisplay,
        },
        relatedId: booking._id,
        relatedModel: 'Booking',
        priority: 'high',
        notificationType: 'info', // For toast popup display
      });
      // Emit notification via socket for real-time updates
      emitAdminNotification(adminNotification);
    } catch (notifError) {
      console.error('Error creating admin notification:', notifError);
      // Don't fail the booking if notification fails
    }

    // Create user notification (don't fail if this fails)
    try {
      const bookingIdDisplay = booking.bookingId || booking._id.toString().slice(-6).toUpperCase();
      const userNotification = await UserNotification.create({
        userId: req.user._id,
        type: 'booking',
        title: 'Booking Request Sent Successfully',
        message: `Your booking request for shipment ${shipment.origin} to ${shipment.destination} has been sent successfully. Booking ID: ${bookingIdDisplay}. Status: Pending approval.`,
        msgKey: 'notifications.user.bookingRequestSent',
        params: {
          origin: shipment.origin,
          destination: shipment.destination,
          bookingId: bookingIdDisplay,
        },
        relatedId: booking._id,
        relatedModel: 'Booking',
        priority: 'medium',
        notificationType: 'success', // For toast popup display
      });
      // Emit notification via socket for real-time updates
      emitUserNotification(req.user._id, userNotification);
    } catch (notifError) {
      console.error('Error creating user notification:', notifError);
      // Don't fail the booking if notification fails
    }

    // Emit socket event to notify all users about booking status change
    try {
      emitShipmentBookingStatus(shipmentObjectId.toString(), {
        isBooked: true,
        bookedBy: req.user.name || 'Unknown User',
        bookingStatus: 'Pending',
      });
      emitBookingUpdate(populatedBooking);
    } catch (socketError) {
      console.error('Error emitting socket event:', socketError);
      // Don't fail the booking if socket fails
    }

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Booking creation error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      stack: error.stack
    });
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      // Check if it's the bookingId duplicate (race condition in ID generation)
      if (error.keyPattern && error.keyPattern.bookingId) {
        // This is a bookingId collision, not a duplicate booking
        // Check if there's actually a duplicate booking for this shipment
        const existingBooking = await Booking.findOne({
          shipmentId: shipmentObjectId,
          status: { $in: ['Pending', 'Approved'] },
        });
        
        if (existingBooking) {
          const isCurrentUserBooking = existingBooking.userId.toString() === userObjectId.toString();
          if (isCurrentUserBooking) {
            return res.status(400).json({ 
              message: 'You already have a booking for this shipment',
              error: 'Duplicate booking detected',
              code: 'DUPLICATE_USER_BOOKING'
            });
          } else {
            return res.status(400).json({ 
              message: 'This shipment is already booked by another user',
              error: 'Shipment already has an active booking',
              code: 'DUPLICATE_BOOKING'
            });
          }
        }
        
        // If no duplicate booking found, it's just a bookingId collision - retry
        console.warn('BookingId collision detected, this should be handled by retry logic');
        return res.status(400).json({ 
          message: 'Booking ID conflict. Please try again.',
          error: 'Booking ID generation conflict',
          code: 'BOOKING_ID_CONFLICT'
        });
      }
      
      // Check if it's the shipmentId unique constraint (first-come, first-served)
      if (error.keyPattern && error.keyPattern.shipmentId) {
        return res.status(400).json({ 
          message: 'This shipment is already booked by another user',
          error: 'Shipment already has an active booking',
          code: 'DUPLICATE_BOOKING'
        });
      }
      // Check if it's the userId+shipmentId unique constraint (user booking same shipment twice)
      if (error.keyPattern && error.keyPattern.userId && error.keyPattern.shipmentId) {
        return res.status(400).json({ 
          message: 'You already have a booking for this shipment',
          error: 'Duplicate booking detected',
          code: 'DUPLICATE_USER_BOOKING'
        });
      }
      // Check if it's an old index error (shouldn't happen after migration, but handle gracefully)
      if (error.keyPattern && (error.keyPattern.user || error.keyPattern.shipment)) {
        console.warn('Old database index detected. Please run: node scripts/dropOldIndex.js');
        return res.status(400).json({ 
          message: 'You already have a booking for this shipment',
          error: 'Database index conflict. Please contact administrator.',
          code: 'INDEX_ERROR'
        });
      }
      // Generic duplicate error
      return res.status(400).json({ 
        message: 'This booking already exists',
        error: 'Duplicate booking detected',
        code: 'DUPLICATE_BOOKING'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: error.errors,
        code: 'VALIDATION_ERROR'
      });
    }
    
    res.status(500).json({ 
      message: error.message || 'Failed to create booking',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      code: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res) => {
  try {
    const { userId, status } = req.query;
    const query = {};

    // If not admin, only show user's bookings
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    } else if (userId) {
      query.userId = userId;
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('shipmentId')
      .populate('userId', 'name phone vehicleNumber')
      .sort({ createdAt: -1 });

    // Remove duplicates based on _id
    const uniqueBookings = [];
    const seenIds = new Set();
    for (const booking of bookings) {
      const id = booking._id?.toString();
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        uniqueBookings.push(booking);
      }
    }

    res.json(uniqueBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('shipmentId')
      .populate('userId', 'name phone vehicleNumber');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      booking.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private/Admin
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    const updatedBooking = await booking.save();

    const populatedBooking = await Booking.findById(updatedBooking._id)
      .populate('shipmentId')
      .populate('userId', 'name phone vehicleNumber');

    // Update shipment status if booking is approved
    if (status === 'Approved') {
      await Shipment.findByIdAndUpdate(booking.shipmentId, {
        status: 'In Transit',
      });
    }

    // If booking is rejected or cancelled, shipment becomes available again
    if (['Rejected', 'Cancelled'].includes(status)) {
      // Emit socket event to notify all users that shipment is now available
      try {
        emitShipmentBookingStatus(booking.shipmentId.toString(), {
          isBooked: false,
          bookedBy: null,
          bookingStatus: null,
        });
      } catch (socketError) {
        console.error('Error emitting socket event:', socketError);
      }
    } else {
      // Emit booking update
      try {
        emitBookingUpdate(populatedBooking);
        emitShipmentBookingStatus(booking.shipmentId.toString(), {
          isBooked: true,
          bookedBy: populatedBooking.userId?.name || populatedBooking.userName,
          bookingStatus: status,
        });
      } catch (socketError) {
        console.error('Error emitting socket event:', socketError);
      }
    }

    // Create user notification
    const bookingIdDisplay = populatedBooking.bookingId || booking._id.toString().slice(-6).toUpperCase();
    const origin = populatedBooking.shipmentDetails?.origin || populatedBooking.shipmentId?.origin || 'N/A';
    const destination = populatedBooking.shipmentDetails?.destination || populatedBooking.shipmentId?.destination || 'N/A';
    
    let statusMessage = '';
    let msgKey = '';
    if (status === 'Approved') {
      statusMessage = `Your booking has been approved! Shipment: ${origin} to ${destination}. Booking ID: ${bookingIdDisplay}. The shipment is now in transit.`;
      msgKey = 'notifications.user.bookingApproved';
    } else if (status === 'Rejected') {
      statusMessage = `Your booking request has been rejected. Shipment: ${origin} to ${destination}. Booking ID: ${bookingIdDisplay}.`;
      msgKey = 'notifications.user.bookingRejected';
    } else if (status === 'Cancelled') {
      statusMessage = `Your booking has been cancelled. Shipment: ${origin} to ${destination}. Booking ID: ${bookingIdDisplay}.`;
      msgKey = 'notifications.user.bookingCancelled';
    } else if (status === 'Completed') {
      statusMessage = `Your booking has been completed successfully! Shipment: ${origin} to ${destination}. Booking ID: ${bookingIdDisplay}.`;
      msgKey = 'notifications.user.bookingCompleted';
    } else {
      statusMessage = `Your booking status has been updated to ${status.toLowerCase()}. Shipment: ${origin} to ${destination}. Booking ID: ${bookingIdDisplay}.`;
      msgKey = 'notifications.user.bookingStatusUpdated';
    }
    
    let notificationType = 'info'; // Default type for toast popup
    if (status === 'Approved') {
      notificationType = 'success';
    } else if (status === 'Rejected') {
      notificationType = 'error';
    } else if (status === 'Cancelled') {
      notificationType = 'warning';
    } else if (status === 'Completed') {
      notificationType = 'success';
    }
    
    const userNotification = await UserNotification.create({
      userId: booking.userId,
      type: 'booking',
      title: `Booking ${status}`,
      message: statusMessage,
      msgKey: msgKey,
      params: {
        origin: origin,
        destination: destination,
        bookingId: bookingIdDisplay,
        status: status.toLowerCase(),
      },
      relatedId: booking._id,
      relatedModel: 'Booking',
      priority: status === 'Approved' ? 'high' : status === 'Rejected' ? 'medium' : 'low',
      notificationType: notificationType, // For toast popup display
    });
    
    // Emit notification via socket for real-time updates
    emitUserNotification(booking.userId, userNotification);

    res.json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      booking.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Store shipmentId before deletion
    const shipmentIdStr = booking.shipmentId.toString();
    const bookingStatus = booking.status;

    await booking.deleteOne();

    // Check if there are any other active bookings for this shipment
    const otherActiveBookings = await Booking.find({
      shipmentId: booking.shipmentId,
      status: { $in: ['Pending', 'Approved'] },
    });

    // If no other active bookings exist, make shipment available again
    if (otherActiveBookings.length === 0) {
      try {
        emitShipmentBookingStatus(shipmentIdStr, {
          isBooked: false,
          bookedBy: null,
          bookingStatus: null,
        });
      } catch (socketError) {
        console.error('Error emitting socket event:', socketError);
      }
    }

    res.json({ message: 'Booking removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

