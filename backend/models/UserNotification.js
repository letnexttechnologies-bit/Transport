import mongoose from 'mongoose';

const userNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user ID'],
    },
    type: {
      type: String,
      enum: ['booking', 'shipment', 'system', 'update'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    msgKey: {
      type: String,
      required: false,
    },
    params: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedModel',
    },
    relatedModel: {
      type: String,
      enum: ['Booking', 'Shipment'],
    },
    read: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    notificationType: {
      type: String,
      enum: ['success', 'error', 'warning', 'info'],
      default: 'info',
    },
  },
  {
    timestamps: true,
  }
);

const UserNotification = mongoose.model('UserNotification', userNotificationSchema);

export default UserNotification;


