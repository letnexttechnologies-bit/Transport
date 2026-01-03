import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    origin: {
      type: String,
      required: [true, 'Please provide origin'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Please provide destination'],
      trim: true,
    },
    vehicleType: {
      type: String,
      required: [true, 'Please provide vehicle type'],
      trim: true,
    },
    load: {
      type: String,
      required: [true, 'Please provide load type'],
      trim: true,
    },
    weight: {
      type: Number,
      required: [true, 'Please provide weight'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide date'],
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Pending', 'In Transit', 'At Warehouse', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    eta: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      default: 0,
    },
    driver: {
      name: String,
      phone: String,
      vehicleNumber: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    coordinates: {
      origin: {
        lat: Number,
        lng: Number,
      },
      destination: {
        lat: Number,
        lng: Number,
      },
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Generate shipment ID before saving
shipmentSchema.pre('save', async function (next) {
  // Only generate ID for new documents without shipmentId
  if (!this.shipmentId && this.isNew) {
    try {
      // Use the model directly (it's already defined)
      const ShipmentModel = this.constructor;
      
      // Find all shipments with SH## format and get the highest number
      const existingShipments = await ShipmentModel.find({ 
        shipmentId: { $exists: true, $regex: /^SH\d+$/ } 
      }).select('shipmentId').lean();
      
      let nextNumber = 1;
      if (existingShipments.length > 0) {
        // Extract numbers and find the max
        const numbers = existingShipments
          .map(s => {
            const match = s.shipmentId?.match(/^SH(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter(n => n > 0);
        
        if (numbers.length > 0) {
          nextNumber = Math.max(...numbers) + 1;
        }
      }
      
      // Generate SH01, SH02, etc. (starting from 01)
      const number = String(nextNumber).padStart(2, '0');
      this.shipmentId = `SH${number}`;
      
      // Double-check for duplicates (safety check)
      const exists = await ShipmentModel.findOne({ shipmentId: this.shipmentId });
      if (exists && exists._id.toString() !== this._id?.toString()) {
        // If exists, find the next available number
        let checkNumber = nextNumber + 1;
        while (checkNumber < 100) {
          const checkId = `SH${String(checkNumber).padStart(2, '0')}`;
          const checkExists = await ShipmentModel.findOne({ shipmentId: checkId });
          if (!checkExists) {
            this.shipmentId = checkId;
            break;
          }
          checkNumber++;
        }
      }
    } catch (error) {
      console.error('Error generating shipment ID:', error);
      // If count fails, use timestamp as fallback
      const number = String(Date.now() % 100).padStart(2, '0');
      this.shipmentId = `SH${number}`;
    }
  }
  next();
});

const Shipment = mongoose.model('Shipment', shipmentSchema);

export default Shipment;

