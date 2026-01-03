// Socket.io configuration and event handlers
// This file exports socket event handlers that can be used throughout the application

import AdminNotification from './models/AdminNotification.js';
import UserNotification from './models/UserNotification.js';

// Socket.io instance will be passed from server.js
let ioInstance = null;

// Initialize socket instance
export const initSocket = (io) => {
  ioInstance = io;
};

// Emit notification to user
export const emitUserNotification = (userId, notification) => {
  if (ioInstance) {
    // Convert Mongoose document to plain object to ensure all fields are included
    const notificationData = notification.toObject ? notification.toObject() : notification;
    const userIdStr = userId?.toString() || userId;
    const roomName = `user-${userIdStr}`;
    
    console.log(`Emitting notification to room: ${roomName}`);
    console.log('Notification payload:', {
      _id: notificationData._id,
      title: notificationData.title,
      message: notificationData.message,
      msgKey: notificationData.msgKey,
      params: notificationData.params,
      notificationType: notificationData.notificationType
    });
    
    ioInstance.to(roomName).emit('new-notification', notificationData);
    
    // Also log which rooms exist (for debugging)
    const rooms = ioInstance.sockets.adapter.rooms;
    console.log(`Available rooms:`, Array.from(rooms.keys()).filter(r => r.startsWith('user-')));
  } else {
    console.warn('Socket instance not initialized, cannot emit user notification');
  }
};

// Emit notification to admin
export const emitAdminNotification = (notification) => {
  if (ioInstance) {
    try {
      // Convert Mongoose document to plain object to ensure all fields are included
      let notificationData;
      if (notification && typeof notification.toObject === 'function') {
        notificationData = notification.toObject({ getters: true, virtuals: false });
      } else {
        notificationData = notification || {};
      }
      
      // Ensure all required fields are present
      const cleanNotification = {
        _id: notificationData._id,
        type: notificationData.type || 'booking',
        title: notificationData.title || 'Notification',
        message: notificationData.message || '',
        msgKey: notificationData.msgKey,
        params: notificationData.params || {},
        notificationType: notificationData.notificationType || 'info',
        priority: notificationData.priority || 'medium',
        read: notificationData.read || false,
        relatedId: notificationData.relatedId,
        relatedModel: notificationData.relatedModel,
        createdAt: notificationData.createdAt,
        updatedAt: notificationData.updatedAt,
      };
      
      console.log('Emitting admin notification:', cleanNotification);
      ioInstance.to('admin-room').emit('new-admin-notification', cleanNotification);
    } catch (error) {
      console.error('Error emitting admin notification:', error);
    }
  } else {
    console.warn('Socket instance not initialized, cannot emit admin notification');
  }
};

// Emit booking update
export const emitBookingUpdate = (booking) => {
  if (ioInstance) {
    const userId = booking.userId?._id || booking.userId?.id || booking.userId;
    ioInstance.to(`user-${userId}`).emit('booking-update', booking);
    ioInstance.to('admin-room').emit('booking-update', booking);
  }
};

// Emit shipment update
export const emitShipmentUpdate = (shipment) => {
  if (ioInstance) {
    ioInstance.emit('shipment-update', shipment);
  }
};

// Emit shipment booking status change (broadcast to all users)
export const emitShipmentBookingStatus = (shipmentId, bookingStatus) => {
  if (ioInstance) {
    // Broadcast to all connected users so they see real-time booking status
    ioInstance.emit('shipment-booking-status', {
      shipmentId,
      isBooked: bookingStatus.isBooked,
      bookedBy: bookingStatus.bookedBy,
      bookingStatus: bookingStatus.bookingStatus,
    });
  }
};

// Helper function to send notification and emit socket event
export const createAndEmitNotification = async (type, data) => {
  try {
    if (type === 'admin') {
      const notification = await AdminNotification.create(data);
      emitAdminNotification(notification);
      return notification;
    } else if (type === 'user') {
      const notification = await UserNotification.create(data);
      emitUserNotification(data.userId, notification);
      return notification;
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export default {
  initSocket,
  emitUserNotification,
  emitAdminNotification,
  emitBookingUpdate,
  emitShipmentUpdate,
  emitShipmentBookingStatus,
  createAndEmitNotification,
};

