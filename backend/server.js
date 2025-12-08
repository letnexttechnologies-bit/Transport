const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 8080;

// CORS Configuration
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure data directory exists
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "shipment-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Helper functions for JSON file operations
const loadData = (filename) => {
  const filePath = path.join(__dirname, "data", `${filename}.json`);
  if (!fs.existsSync(filePath)) {
    // Initialize with empty array
    if (filename === 'shipments') {
      const initialShipments = [
        {
          id: "SH1001",
          origin: "Chennai",
          destination: "Bangalore",
          vehicleType: "Truck",
          load: "Electronics",
          weight: "5 tons",
          truck: "10-wheeler",
          eta: "2 days",
          status: "At Warehouse",
          priority: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "SH1002",
          origin: "Coimbatore",
          destination: "Chennai",
          vehicleType: "Container",
          load: "Textiles",
          weight: "8 tons",
          truck: "12-wheeler",
          eta: "1 day",
          status: "In Transit",
          priority: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "SH1003",
          origin: "Erode",
          destination: "Salem",
          vehicleType: "Mini Truck",
          load: "Agricultural Products",
          weight: "3 tons",
          truck: "6-wheeler",
          eta: "6 hours",
          status: "At Warehouse",
          priority: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "SH1004",
          origin: "Mumbai",
          destination: "Delhi",
          vehicleType: "Container",
          load: "Machinery",
          weight: "12 tons",
          truck: "16-wheeler",
          eta: "3 days",
          status: "In Transit",
          priority: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "SH1005",
          origin: "Bangalore",
          destination: "Hyderabad",
          vehicleType: "Truck",
          load: "Automobile Parts",
          weight: "6 tons",
          truck: "10-wheeler",
          eta: "1.5 days",
          status: "At Warehouse",
          priority: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      fs.writeFileSync(filePath, JSON.stringify(initialShipments, null, 2));
      return initialShipments;
    } else if (filename === 'users') {
      const initialUsers = [
        {
          id: "USER1001",
          name: "Admin User",
          age: 35,
          gender: "Male",
          phone: "9876543210",
          vehicleNumber: "TN01AB1234",
          password: "admin123",
          role: "admin",
          createdAt: new Date().toISOString()
        },
        {
          id: "USER1002",
          name: "John Doe",
          age: 28,
          gender: "Male",
          phone: "9876543211",
          vehicleNumber: "TN02CD5678",
          password: "user123",
          role: "user",
          createdAt: new Date().toISOString()
        }
      ];
      fs.writeFileSync(filePath, JSON.stringify(initialUsers, null, 2));
      return initialUsers;
    } else {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      return [];
    }
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
};

const saveData = (filename, data) => {
  const filePath = path.join(__dirname, "data", `${filename}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Initialize all data files
const initializeDataFiles = () => {
  const dataFiles = ['users', 'shipments', 'bookings', 'notifications', 'admin_notifications'];
  
  dataFiles.forEach(filename => {
    loadData(filename);
  });
  
  console.log('✅ Data files initialized');
};

// Call initialization
initializeDataFiles();

// ==================== AUTH ROUTES ====================
app.post("/auth/register", (req, res) => {
  try {
    const { name, age, gender, phone, vehicleNumber, password, role = 'user' } = req.body;

    if (!name || !age || !gender || !phone || !vehicleNumber || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const users = loadData("users");
    const existingUser = users.find((u) => u.phone === phone);

    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists with this phone number" });
    }

    const newUser = {
      id: "USER" + Date.now(),
      name,
      age: parseInt(age),
      gender,
      phone,
      vehicleNumber,
      password,
      role,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveData("users", users);

    res.status(201).json({ 
      success: true, 
      message: "Registration successful", 
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
        vehicleNumber: newUser.vehicleNumber
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/auth/login", (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: "Phone & password required" });
    }

    const users = loadData("users");
    const user = users.find((u) => u.phone === phone && u.password === password);

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ 
      success: true, 
      message: "Login successful", 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== SHIPMENT ROUTES ====================
app.post("/shipments", upload.single("image"), (req, res) => {
  try {
    const {
      vehicleType,
      status = "At Warehouse",
      origin,
      destination,
      eta,
      loadDescription,
      truckType,
      container,
      weight,
      priority = "false",
      userId,
    } = req.body;

    if (!vehicleType || !origin || !destination || !userId) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing: vehicleType, origin, destination, userId",
      });
    }

    const shipments = loadData("shipments");

    const newShipment = {
      id: "SH" + Date.now(),
      vehicleType,
      status,
      origin,
      destination,
      eta: eta || "Not specified",
      load: loadDescription || "General Cargo",
      weight: weight || "Not specified",
      truck: truckType || "Standard",
      container: container || "Not specified",
      priority: priority === "true",
      userId,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    shipments.push(newShipment);
    saveData("shipments", shipments);
    
    // Create notification for all users about new shipment
    const notifications = loadData("notifications");
    const notification = {
      id: Date.now(),
      message: `🚚 New shipment available: ${origin} → ${destination}`,
      type: 'info',
      timestamp: new Date().toISOString(),
      forAllUsers: true
    };
    notifications.push(notification);
    saveData("notifications", notifications);

    res.status(201).json({ 
      success: true, 
      message: "Shipment created successfully", 
      shipment: newShipment 
    });
  } catch (error) {
    console.error("Create shipment error:", error);
    res.status(500).json({ success: false, message: "Failed to create shipment" });
  }
});

app.get("/shipments", (req, res) => {
  try {
    const { userId, status, origin, destination } = req.query;

    let shipments = loadData("shipments");

    // Apply filters
    if (userId) shipments = shipments.filter((s) => s.userId === userId);
    if (status) shipments = shipments.filter((s) => s.status === status);
    if (origin) shipments = shipments.filter((s) => s.origin.toLowerCase().includes(origin.toLowerCase()));
    if (destination) shipments = shipments.filter((s) => s.destination.toLowerCase().includes(destination.toLowerCase()));

    res.json({ success: true, shipments });
  } catch (error) {
    console.error("Get shipments error:", error);
    res.status(500).json({ success: false, message: "Error fetching shipments" });
  }
});

app.get("/shipments/:id", (req, res) => {
  try {
    const { id } = req.params;
    const shipments = loadData("shipments");
    const shipment = shipments.find((s) => s.id === id);

    if (!shipment) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    res.json({ success: true, shipment });
  } catch (error) {
    console.error("Get shipment error:", error);
    res.status(500).json({ success: false, message: "Error fetching shipment" });
  }
});

app.put("/shipments/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const shipments = loadData("shipments");
    const shipmentIndex = shipments.findIndex((s) => s.id === id);

    if (shipmentIndex === -1) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    // Update shipment
    shipments[shipmentIndex] = {
      ...shipments[shipmentIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    saveData("shipments", shipments);
    
    // If status changed, create notifications for booked users
    if (updates.status) {
      const bookings = loadData("bookings");
      const booking = bookings.find(b => b.shipmentId === id);
      
      if (booking) {
        const notifications = loadData("notifications");
        const notification = {
          id: Date.now(),
          userId: booking.userId,
          message: `Your booked shipment ${id} status changed to ${updates.status}`,
          type: updates.status === 'Delivered' ? 'success' : 'info',
          timestamp: new Date().toISOString(),
          read: false
        };
        notifications.push(notification);
        saveData("notifications", notifications);
      }
    }

    res.json({ 
      success: true, 
      message: "Shipment updated successfully", 
      shipment: shipments[shipmentIndex] 
    });
  } catch (error) {
    console.error("Update shipment error:", error);
    res.status(500).json({ success: false, message: "Failed to update shipment" });
  }
});

app.delete("/shipments/:id", (req, res) => {
  try {
    const { id } = req.params;
    const shipments = loadData("shipments");
    const index = shipments.findIndex((s) => s.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    shipments.splice(index, 1);
    saveData("shipments", shipments);

    res.json({ success: true, message: "Shipment deleted successfully" });
  } catch (error) {
    console.error("Delete shipment error:", error);
    res.status(500).json({ success: false, message: "Failed to delete shipment" });
  }
});

// ==================== BOOKING ROUTES ====================
app.get("/bookings", (req, res) => {
  try {
    const { userId } = req.query;
    const bookings = loadData("bookings");
    
    let filteredBookings = bookings;
    if (userId) {
      filteredBookings = bookings.filter(b => b.userId === userId);
    }
    
    res.json({ success: true, bookings: filteredBookings });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ success: false, message: "Error fetching bookings" });
  }
});

app.post("/bookings", (req, res) => {
  try {
    const { shipmentId, userId, userName, userPhone } = req.body;

    if (!shipmentId || !userId || !userName || !userPhone) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    // Check if shipment exists and is available
    const shipments = loadData("shipments");
    const shipment = shipments.find(s => s.id === shipmentId);
    
    if (!shipment) {
      return res.status(404).json({ 
        success: false, 
        message: "Shipment not found" 
      });
    }

    if (shipment.status === "Delivered" || shipment.status === "Cancelled") {
      return res.status(400).json({ 
        success: false, 
        message: "Shipment is not available for booking" 
      });
    }

    // Check if user already has a pending booking for this shipment
    const bookings = loadData("bookings");
    const existingBooking = bookings.find(b => 
      b.shipmentId === shipmentId && b.userId === userId && b.status === "Pending"
    );

    if (existingBooking) {
      return res.status(400).json({ 
        success: false, 
        message: "You already have a pending booking for this shipment" 
      });
    }

    const newBooking = {
      id: "BK" + Date.now(),
      shipmentId,
      userId,
      userName,
      userPhone,
      status: "Pending",
      bookedAt: new Date().toISOString(),
      shipmentDetails: shipment
    };

    bookings.push(newBooking);
    saveData("bookings", bookings);

    // Create admin notification
    const adminNotifications = loadData("admin_notifications");
    const adminNotification = {
      id: Date.now(),
      userId: userId,
      userName: userName,
      message: `User ${userName} booked shipment ${shipmentId}`,
      type: 'booking_request',
      timestamp: new Date().toISOString(),
      read: false,
      shipmentId: shipmentId,
      bookingId: newBooking.id
    };
    adminNotifications.push(adminNotification);
    saveData("admin_notifications", adminNotifications);

    // Create user notification
    const notifications = loadData("notifications");
    const userNotification = {
      id: Date.now(),
      userId: userId,
      message: `✅ Booking request sent for shipment ${shipmentId}! Admin will review soon.`,
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false
    };
    notifications.push(userNotification);
    saveData("notifications", notifications);

    res.status(201).json({ 
      success: true, 
      message: "Booking request submitted successfully", 
      booking: newBooking 
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ success: false, message: "Failed to create booking" });
  }
});

app.put("/bookings/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: "Status is required" 
      });
    }

    const bookings = loadData("bookings");
    const bookingIndex = bookings.findIndex(b => b.id === id);

    if (bookingIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found" 
      });
    }

    const oldStatus = bookings[bookingIndex].status;
    bookings[bookingIndex].status = status;
    saveData("bookings", bookings);

    // Create user notification
    const notifications = loadData("notifications");
    let message = "";
    
    switch(status) {
      case "Confirmed":
        message = `🎉 Your booking ${id} has been CONFIRMED!`;
        break;
      case "Cancelled":
        message = `❌ Your booking ${id} was CANCELLED by admin.`;
        break;
      case "In Transit":
        message = `🚚 Your booked shipment ${bookings[bookingIndex].shipmentId} is now IN TRANSIT!`;
        break;
      case "Delivered":
        message = `✅ Your booked shipment ${bookings[bookingIndex].shipmentId} has been DELIVERED!`;
        break;
      default:
        message = `Your booking ${id} status changed from ${oldStatus} to ${status}`;
    }

    const notification = {
      id: Date.now(),
      userId: bookings[bookingIndex].userId,
      message: message,
      type: status === "Cancelled" ? "warning" : "success",
      timestamp: new Date().toISOString(),
      read: false
    };
    notifications.push(notification);
    saveData("notifications", notifications);

    // Update shipment status if needed
    if (status === "Confirmed") {
      const shipments = loadData("shipments");
      const shipmentIndex = shipments.findIndex(s => s.id === bookings[bookingIndex].shipmentId);
      if (shipmentIndex !== -1) {
        shipments[shipmentIndex].status = "Booked";
        shipments[shipmentIndex].updatedAt = new Date().toISOString();
        saveData("shipments", shipments);
      }
    }

    res.json({ 
      success: true, 
      message: "Booking updated successfully", 
      booking: bookings[bookingIndex] 
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({ success: false, message: "Failed to update booking" });
  }
});

app.delete("/bookings/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const bookings = loadData("bookings");
    const bookingIndex = bookings.findIndex(b => b.id === id);

    if (bookingIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found" 
      });
    }

    const booking = bookings[bookingIndex];
    
    // Check if user is authorized to cancel
    if (booking.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to cancel this booking" 
      });
    }

    booking.status = "Cancelled";
    saveData("bookings", bookings);

    // Create admin notification
    const adminNotifications = loadData("admin_notifications");
    const adminNotification = {
      id: Date.now(),
      userId: userId,
      userName: booking.userName,
      message: `User ${booking.userName} cancelled booking ${id}`,
      type: 'booking_cancelled',
      timestamp: new Date().toISOString(),
      read: false,
      bookingId: id
    };
    adminNotifications.push(adminNotification);
    saveData("admin_notifications", adminNotifications);

    // Create user notification
    const notifications = loadData("notifications");
    const userNotification = {
      id: Date.now(),
      userId: userId,
      message: `Booking ${id} cancelled successfully`,
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false
    };
    notifications.push(userNotification);
    saveData("notifications", notifications);

    res.json({ 
      success: true, 
      message: "Booking cancelled successfully" 
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ success: false, message: "Failed to cancel booking" });
  }
});

// ==================== NOTIFICATION ROUTES ====================
app.get("/notifications/user/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = loadData("notifications");
    
    // Get user-specific notifications and general notifications
    const userNotifications = notifications.filter(n => 
      n.userId === userId || n.forAllUsers === true
    );
    
    // Sort by timestamp (newest first)
    userNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({ success: true, notifications: userNotifications });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: "Error fetching notifications" });
  }
});

app.get("/notifications/admin", (req, res) => {
  try {
    const adminNotifications = loadData("admin_notifications");
    
    // Sort by timestamp (newest first)
    adminNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({ success: true, notifications: adminNotifications });
  } catch (error) {
    console.error("Get admin notifications error:", error);
    res.status(500).json({ success: false, message: "Error fetching admin notifications" });
  }
});

app.put("/notifications/:id/read", (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const notifications = loadData("notifications");
    const notificationIndex = notifications.findIndex(n => n.id.toString() === id.toString());

    if (notificationIndex !== -1) {
      notifications[notificationIndex].read = true;
      saveData("notifications", notifications);
      return res.json({ success: true, message: "Notification marked as read" });
    }

    // Check admin notifications
    const adminNotifications = loadData("admin_notifications");
    const adminNotificationIndex = adminNotifications.findIndex(n => n.id.toString() === id.toString());

    if (adminNotificationIndex !== -1) {
      adminNotifications[adminNotificationIndex].read = true;
      saveData("admin_notifications", adminNotifications);
      return res.json({ success: true, message: "Notification marked as read" });
    }

    res.status(404).json({ success: false, message: "Notification not found" });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ success: false, message: "Failed to update notification" });
  }
});

app.delete("/notifications/user/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    
    const notifications = loadData("notifications");
    // Remove user-specific notifications (keep general notifications)
    const filteredNotifications = notifications.filter(n => n.userId !== userId);
    
    saveData("notifications", filteredNotifications);
    
    res.json({ success: true, message: "User notifications cleared" });
  } catch (error) {
    console.error("Clear notifications error:", error);
    res.status(500).json({ success: false, message: "Failed to clear notifications" });
  }
});

// ==================== USER ROUTES ====================
app.get("/users", (req, res) => {
  try {
    const users = loadData("users");
    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json({ success: true, users: usersWithoutPasswords });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
});

app.get("/users/:id", (req, res) => {
  try {
    const { id } = req.params;
    const users = loadData("users");
    const user = users.find(u => u.id === id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
});

// ==================== STATS ROUTES ====================
app.get("/stats", (req, res) => {
  try {
    const shipments = loadData("shipments");
    const bookings = loadData("bookings");
    const users = loadData("users");

    const stats = {
      totalShipments: shipments.length,
      availableShipments: shipments.filter(s => 
        s.status !== "Delivered" && s.status !== "Cancelled" && s.status !== "Booked"
      ).length,
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.status === "Pending").length,
      confirmedBookings: bookings.filter(b => b.status === "Confirmed").length,
      totalUsers: users.length,
      adminUsers: users.filter(u => u.role === "admin").length,
      regularUsers: users.filter(u => u.role === "user").length
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ success: false, message: "Error fetching statistics" });
  }
});

// ==================== CITIES ROUTES ====================
app.get("/cities", (req, res) => {
  try {
    const cities = [
      { name: "Chennai", latitude: 13.0827, longitude: 80.2707 },
      { name: "Coimbatore", latitude: 11.0168, longitude: 76.9558 },
      { name: "Erode", latitude: 11.3410, longitude: 77.7172 },
      { name: "Salem", latitude: 11.6643, longitude: 78.1460 },
      { name: "Mumbai", latitude: 19.0760, longitude: 72.8777 },
      { name: "Delhi", latitude: 28.7041, longitude: 77.1025 },
      { name: "Bangalore", latitude: 12.9716, longitude: 77.5946 },
      { name: "Hyderabad", latitude: 17.3850, longitude: 78.4867 },
      { name: "Kolkata", latitude: 22.5726, longitude: 88.3639 },
      { name: "Pune", latitude: 18.5204, longitude: 73.8567 },
      { name: "Ahmedabad", latitude: 23.0225, longitude: 72.5714 },
      { name: "Jaipur", latitude: 26.9124, longitude: 75.7873 },
      { name: "Tiruppur", latitude: 11.1085, longitude: 77.3411 },
      { name: "Trichy", latitude: 10.7905, longitude: 78.7047 },
      { name: "Madurai", latitude: 9.9252, longitude: 78.1198 }
    ];
    res.json({ success: true, cities });
  } catch (error) {
    console.error("Get cities error:", error);
    res.status(500).json({ success: false, message: "Error fetching cities" });
  }
});

// ==================== HEALTH CHECK ====================
app.get("/health", (req, res) => {
  res.json({ 
    success: true, 
    message: "Server is running", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File size too large. Maximum size is 5MB.' 
      });
    }
  }
  
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
  
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
  console.log(`📁 Data directory: ${path.join(__dirname, 'data')}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🌐 CORS enabled for: http://localhost:5173`);
  console.log('\n📋 Available endpoints:');
  console.log('  AUTH:');
  console.log('    POST /auth/register - Register new user');
  console.log('    POST /auth/login - User login');
  console.log('\n  SHIPMENTS:');
  console.log('    POST /shipments - Create shipment with image');
  console.log('    GET /shipments - Get all shipments');
  console.log('    GET /shipments/:id - Get shipment by ID');
  console.log('    PUT /shipments/:id - Update shipment');
  console.log('    DELETE /shipments/:id - Delete shipment');
  console.log('\n  BOOKINGS:');
  console.log('    GET /bookings - Get all bookings');
  console.log('    POST /bookings - Create booking');
  console.log('    PUT /bookings/:id - Update booking status');
  console.log('    DELETE /bookings/:id - Cancel booking');
  console.log('\n  NOTIFICATIONS:');
  console.log('    GET /notifications/user/:userId - Get user notifications');
  console.log('    GET /notifications/admin - Get admin notifications');
  console.log('    PUT /notifications/:id/read - Mark notification as read');
  console.log('    DELETE /notifications/user/:userId - Clear user notifications');
  console.log('\n  USERS:');
  console.log('    GET /users - Get all users');
  console.log('    GET /users/:id - Get user by ID');
  console.log('\n  UTILITY:');
  console.log('    GET /stats - Get statistics');
  console.log('    GET /cities - Get city coordinates');
  console.log('    GET /health - Server health check');
});