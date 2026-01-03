import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      sparse: true,
    },
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipment',
      required: [true, 'Please provide shipment ID'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user ID'],
    },
    userName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
    shipmentDetails: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for faster queries (NON-UNIQUE - users can book multiple shipments)
// We only prevent duplicate bookings for the same shipment by the same user in the controller
bookingSchema.index({ userId: 1, shipmentId: 1 }, { unique: false });
bookingSchema.index({ status: 1 });

// Partial unique index: Only one active booking per shipment (first-come, first-served)
// This ensures no two users can have active bookings for the same shipment
bookingSchema.index(
  { shipmentId: 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: { $in: ['Pending', 'Approved'] } },
    name: 'unique_active_booking_per_shipment'
  }
);

// Generate booking ID before saving
bookingSchema.pre('save', async function (next) {
  if (!this.bookingId && this.userName) {
    try {
      // Get first letter of user name (uppercase)
      const userInitial = this.userName.charAt(0).toUpperCase();
      
      // Get the model
      const BookingModel = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
      
      // Retry logic to handle race conditions
      let attempts = 0;
      const maxAttempts = 10;
      let bookingId;
      
      while (attempts < maxAttempts) {
        // Get the count of existing bookings for this user initial
        const count = await BookingModel.countDocuments({
          bookingId: new RegExp(`^${userInitial}`)
        });
        
        // Generate U10001, D10002, etc. (starting from 10001)
        const number = String(count + 10001);
        bookingId = `${userInitial}${number}`;
        
        // Check if this bookingId already exists
        const existing = await BookingModel.findOne({ bookingId });
        if (!existing) {
          // BookingId is available, use it
          this.bookingId = bookingId;
          break;
        }
        
        // If exists, increment and try again
        attempts++;
        if (attempts >= maxAttempts) {
          // Fallback to timestamp-based ID if all attempts fail
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 1000);
          this.bookingId = `${userInitial}${String(timestamp).slice(-6)}${String(random).padStart(3, '0')}`;
          break;
        }
      }
    } catch (error) {
      console.error('Error generating booking ID:', error);
      // If count fails, use timestamp as fallback
      const userInitial = this.userName.charAt(0).toUpperCase();
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      this.bookingId = `${userInitial}${String(timestamp).slice(-6)}${String(random).padStart(3, '0')}`;
    }
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;

