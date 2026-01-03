import mongoose from 'mongoose';

const adminNotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['booking', 'shipment', 'user', 'system'],
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
      enum: ['Booking', 'Shipment', 'User'],
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

const AdminNotification = mongoose.model('AdminNotification', adminNotificationSchema);

export default AdminNotification;


