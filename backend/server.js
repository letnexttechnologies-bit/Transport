import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import userRoutes from './routes/userRoutes.js';
import shipmentRoutes from './routes/shipmentRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminNotificationRoutes from './routes/adminNotificationRoutes.js';
import userNotificationRoutes from './routes/userNotificationRoutes.js';
import { getShipmentDetails, getShipmentTracking } from './controllers/shipmentDetailsController.js';
import { initSocket } from './socket.js';


// Load env vars
dotenv.config();

// Connect to database
connectDB();


// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://transport-waala.netlify.app/",
  "https://transport-1-eoxq.onrender.com",
];

//  Create Express app + server
const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize socket handlers
initSocket(io);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin/notifications', adminNotificationRoutes);
app.use('/api/users/notifications', userNotificationRoutes);

// Additional shipment detail routes
app.get('/api/shipments/:id/details', getShipmentDetails);
app.get('/api/shipments/:id/tracking', getShipmentTracking);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user room
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Join admin room
  socket.on('join-admin-room', () => {
    socket.join('admin-room');
    console.log('Admin joined admin room');
  });

  // Handle notifications
  socket.on('send-notification', (data) => {
    if (data.userId) {
      io.to(`user-${data.userId}`).emit('new-notification', data);
    }
    if (data.admin) {
      io.to('admin-room').emit('new-admin-notification', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`🌐 API available at: http://localhost:${PORT}/api`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error(`💡 Solution 1: Stop the other process using port ${PORT}`);
    console.error(`💡 Solution 2: Change PORT in .env file to another number (e.g., 5001)`);
    console.error(`💡 To find what's using port ${PORT}, run: netstat -ano | findstr :${PORT}`);
  } else {
    console.error(`❌ Server error: ${err.message}`);
  }
  process.exit(1);
});

export { io };

