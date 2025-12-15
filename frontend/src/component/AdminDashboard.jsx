import React, { useState, useEffect, useRef } from "react";  
import { useSearchParams, useNavigate } from "react-router-dom";  
import "./dashboard.css";  
import "./admin-dashboard.css";
  
export default function AdminDashboard() {  
  const [searchParams] = useSearchParams();  
  const navigate = useNavigate();  
  const role = searchParams.get("role");  
  const [showAddForm, setShowAddForm] = useState(false);  
  const [activeTab, setActiveTab] = useState("shipments");  
  const [searchTerm, setSearchTerm] = useState("");  
  const [adminNotes, setAdminNotes] = useState([]);  
  const [showFilterOptions, setShowFilterOptions] = useState(false);  
  
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");  
  const userId = currentUser.id || "admin";  
  const userName = currentUser.name || "Unknown User";  
  const userPhone = currentUser.phone || "No Phone";  



  

  
  
  // Refs for scrolling  
  const bookingsSectionRef = useRef(null);  
  const shipmentsSectionRef = useRef(null);  
  
  // Origin and destination suggestions  
  const originSuggestions = [  
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Kerala", "Madhya Pradesh"  
  ];  
    
  const destinationSuggestions = [  
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",   
    "Goa", "Gujarat", "Haryana"  
  ];  
  
  // Load shipments and bookings from localStorage  
  const [shipments, setShipments] = useState(() => {  
    const savedShipments = localStorage.getItem('shipments');  
    return savedShipments ? JSON.parse(savedShipments) : [];  
  });  
  
  const [bookings, setBookings] = useState(() => {  
    const savedBookings = localStorage.getItem('bookings');  
    return savedBookings ? JSON.parse(savedBookings) : [];  
  });  


  // ----------------------------
// NOTIFICATION SYSTEM (FIXED)
// ----------------------------
const [notifications, setNotifications] = useState(() => {
  try {
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error("Failed to parse notifications from localStorage", err);
    return [];
  }
});

const [showNotifications, setShowNotifications] = useState(false);

// How many are unread (for red badge)
const unreadCount = notifications.filter(n => !n.read).length;

// Save notifications whenever they change
useEffect(() => {
  localStorage.setItem("notifications", JSON.stringify(notifications));
}, [notifications]);

// Auto-close notification dropdown
useEffect(() => {
  if (!showNotifications) return;
  const timer = setTimeout(() => setShowNotifications(false), 2000);
  return () => clearTimeout(timer);
}, [showNotifications]);



  
  const [newShipment, setNewShipment] = useState({  
    vehicleType: "",  
    status: "Scheduled",  
    origin: "",  
    destination: "",  
    eta: "",  
    load: "",  
    truck: "",  
    container: "",  
    weight: "",  
    priority: false,  
    image: "",  
    driver: {  
      name: "",  
      phone: "",  
      license: "",  
      vehicle: ""  
    }  
  });  
  
  // State for suggestions dropdown  
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);  
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);  
  const [filteredOriginSuggestions, setFilteredOriginSuggestions] = useState(originSuggestions);  
  const [filteredDestinationSuggestions, setFilteredDestinationSuggestions] = useState(destinationSuggestions);  
  
  // Drag and drop state  
  const [isDragOver, setIsDragOver] = useState(false);  
  const fileInputRef = useRef(null);  
  
  // Save to localStorage effects  
  useEffect(() => {  
    localStorage.setItem('shipments', JSON.stringify(shipments));  
  }, [shipments]);  
  
  useEffect(() => {  
    localStorage.setItem('bookings', JSON.stringify(bookings));  
  }, [bookings]);  
  
  // Load admin notes on mount  
  useEffect(() => {  
    if (role === "admin") {  
      const saved = JSON.parse(localStorage.getItem("adminNotes") || "[]");  
      setAdminNotes(saved);  
    }  
  }, [role, showNotifications]);  

  useEffect(() => {
  if (role !== "admin") return;

  fetch(`http://localhost:8080/api/notifications?userId=admin&role=admin`)
    .then(res => res.json())
    .then(data => {
      if (data.success) setNotifications(data.data);
    });
}, [role]);


  useEffect(() => {
  if (showAddForm) document.body.classList.add("modal-open");
  else document.body.classList.remove("modal-open");
}, [showAddForm]);

  
  // Load notifications from localStorage  

  
  // Auto-close notifications  
  useEffect(() => {  
    if (showNotifications) {  
      const timer = setTimeout(() => {  
        setShowNotifications(false);  
      }, 2000);  
      return () => clearTimeout(timer);  
    }  
  }, [showNotifications]);  
  
  // Auto-close filter options  
  useEffect(() => {  
    if (showFilterOptions) {  
      const timer = setTimeout(() => {  
        setShowFilterOptions(false);  
      }, 3000);  
      return () => clearTimeout(timer);  
    }  
  }, [showFilterOptions]);  
  
  // Save notifications to localStorage  

  
  // Check for popup notifications  
  useEffect(() => {  
    if (role !== "admin") return;  
  
    const checkPopupNotes = () => {  
      const notes = JSON.parse(localStorage.getItem("adminNotes") || "[]");  
      const popupNote = notes.find(n => n.popup && !n.read);  
  
      if (popupNote) {  
        alert(popupNote.message);  
        const updated = notes.map(n =>   
          n.id === popupNote.id ? { ...n, read: true, popup: false } : n  
        );  
        localStorage.setItem("adminNotes", JSON.stringify(updated));  
        setAdminNotes(updated);  
      }  
    };  
  
    const interval = setInterval(checkPopupNotes, 5000);  
    return () => clearInterval(interval);  
  }, [role]);  


  const addAdminNotification = async (message, type = "info") => {
  await fetch("http://localhost:8080/api/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "admin",
      role: "admin",
      message,
      type
    })
  });
};


  
  // Load saved image  
  useEffect(() => {  
    const loadSavedImage = () => {  
      try {  
        const savedImages = JSON.parse(localStorage.getItem('shipmentImages') || '{}');  
        const lastImageKey = Object.keys(savedImages)[0];  
        if (lastImageKey && savedImages[lastImageKey]) {  
          setNewShipment(prev => ({  
            ...prev,  
            image: savedImages[lastImageKey]  
          }));  
        }  
      } catch (error) {  
        console.error('Error loading saved image:', error);  
      }  
    };  
    loadSavedImage();  
  }, []);  

  // Auto alert Admin Alert when new booking arrives (even if page was open)
useEffect(() => {
  if (role !== "admin") return;

  const checkForNewBookings = () => {
    const currentBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const lastChecked = localStorage.getItem('lastBookingCheck');
    const lastTime = lastChecked ? parseInt(lastChecked) : 0;

    const newBookings = currentBookings.filter(
      b => b.status === "Pending" && new Date(b.bookedAt).getTime() > lastTime
    );

    newBookings.forEach(booking => {
      const msg = `New Booking #${booking.id}\nFrom: ${booking.userName} (${booking.userPhone})\nRoute: ${booking.shipmentDetails?.origin} → ${booking.shipmentDetails?.destination}`;
      
      // Show alert only once
      alert(msg);

      // Add to notifications (visible in bell)
      addNotification(`New booking from ${booking.userName} - ${booking.shipmentDetails?.origin} to ${booking.shipmentDetails?.destination}`, 'warning');
    });

    // Update last checked time
    if (currentBookings.length > 0) {
      const latestTime = Math.max(...currentBookings.map(b => new Date(b.bookedAt).getTime()));
      localStorage.setItem('lastBookingCheck', latestTime.toString());
    }
  };

  // Check immediately + every 10 seconds
  checkForNewBookings();
  const interval = setInterval(checkForNewBookings, 10000);

  return () => clearInterval(interval);
}, [role]);
  
  // Clear all admin notifications  
  const clearAllAdminNotifications = () => {  
    if (!window.confirm("Clear all notifications?")) return;  
    localStorage.setItem("adminNotes", JSON.stringify([]));  
    setAdminNotes([]);  
    setShowNotifications(false);  
  };  
  
  // Scroll functions  
  const scrollToBookingsSection = () => {  
    if (activeTab !== 'bookings') {  
      setActiveTab('bookings');  
    }  
    setTimeout(() => {  
      if (bookingsSectionRef.current) {  
        bookingsSectionRef.current.scrollIntoView({   
          behavior: 'smooth',  
          block: 'start'  
        });  
      }  
    }, 150);  
  };  
  
  const scrollToShipmentsSection = () => {  
    if (activeTab !== "shipments") {  
      setActiveTab("shipments");  
    }  
    setTimeout(() => {  
      if (shipmentsSectionRef.current) {  
        shipmentsSectionRef.current.scrollIntoView({  
          behavior: "smooth",  
          block: "start",  
        });  
      }  
    }, 200);  
  };  
  
  // Generate unique shipment ID  
  const generateShipmentId = () => {  
    const savedShipments = localStorage.getItem('shipments');  
    let lastId = 1000;  
      
    if (savedShipments) {  
      const allShipments = JSON.parse(savedShipments);  
      if (allShipments.length > 0) {  
        const lastShipment = allShipments[allShipments.length - 1];  
        const lastNumber = parseInt(lastShipment.id.replace('SH', ''));  
        lastId = lastNumber;  
      }  
    }  
      
    return `SH${lastId + 1}`;  
  };  
  
  // Filter suggestions  
  const filterOriginSuggestions = (input) => {  
    const filtered = originSuggestions.filter(suggestion =>  
      suggestion.toLowerCase().includes(input.toLowerCase())  
    );  
    setFilteredOriginSuggestions(filtered);  
  };  
  
  const filterDestinationSuggestions = (input) => {  
    const filtered = destinationSuggestions.filter(suggestion =>  
      suggestion.toLowerCase().includes(input.toLowerCase())  
    );  
    setFilteredDestinationSuggestions(filtered);  
  };  
  
  // Handle input changes  
  const handleOriginChange = (value) => {  
    handleInputChange("origin", value);  
    filterOriginSuggestions(value);  
    setShowOriginSuggestions(true);  
  };  
  
  const handleDestinationChange = (value) => {  
    handleInputChange("destination", value);  
    filterDestinationSuggestions(value);  
    setShowDestinationSuggestions(true);  
  };  
  
  const selectOriginSuggestion = (suggestion) => {  
    handleInputChange("origin", suggestion);  
    setShowOriginSuggestions(false);  
  };  
  
  const selectDestinationSuggestion = (suggestion) => {  
    handleInputChange("destination", suggestion);  
    setShowDestinationSuggestions(false);  
  };  
  
  // Calculate statistics  
  const totalShipments = shipments.length;  
  const inTransitCount = shipments.filter(shipment => shipment.status === "In Transit").length;  
  const deliveredCount = shipments.filter(shipment => shipment.status === "Delivered").length;  
  const activeShipments = shipments.filter(shipment =>   
    shipment.status !== "Delivered" && shipment.status !== "Cancelled"  
  ).length;  
  const pendingBookingsForNotification = bookings.filter(booking =>   
    booking.status === "Pending"  
  ).length;  
  
// Add this inside your AdminDashboard component
const addNotification = (message, type = 'info', showAlert = false) => {
  // Add to notification bell
  const newNotification = {
    id: Date.now() + Math.random(), // unique ID
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false
  };

  setNotifications(prev => [newNotification, ...prev]);

  // Show alert popup ONLY for booking-related notifications
  if (showAlert && role === "admin") {
    alert(`New Booking Alert!\n\n${message}`);
  }
};


// After successfully saving a booking (example)
const handleBookingSubmit = () => {
  // ... your existing save logic ...

  // Send notification to Admin
  const adminMessage = `New booking received!\nUser: ${userName}\nPhone: ${userPhone}\nFrom: ${origin} → ${destination}`;

  // Save notification in localStorage so Admin sees it instantly
  const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  const newNotif = {
    id: Date.now(),
    message: `New booking from ${userName} (${userPhone}) - ${origin} to ${destination}`,
    type: 'warning',
    timestamp: new Date().toISOString(),
    read: false
  };

  const updatedNotifications = [newNotif, ...existingNotifications];
  localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

  alert("Booking submitted successfully! Admin will confirm soon.");
};

  
  const markAsRead = (notificationId) => {  
    setNotifications(prev =>   
      prev.map(notif =>   
        notif.id === notificationId ? { ...notif, read: true } : notif  
      )  
    );  
  };  
  

  
  // Handle drag events  
  const handleDragOver = (e) => {  
    e.preventDefault();  
    setIsDragOver(true);  
  };  
  
  const handleDragLeave = (e) => {  
    e.preventDefault();  
    setIsDragOver(false);  
  };  
  
  const handleDrop = (e) => {  
    e.preventDefault();  
    setIsDragOver(false);  
    const files = e.dataTransfer.files;  
    if (files.length > 0) {  
      handleImageUpload(files[0]);  
    }  
  };  
  
  // Enhanced image upload handler  
  const handleImageUpload = (file) => {  
    if (!file) return;  
      
    if (!file.type.startsWith('image/')) {  
      addNotification('Please select an image file (JPEG, PNG, GIF, etc.)', 'warning');  
      return;  
    }  
      
    if (file.size > 5 * 1024 * 1024) {  
      addNotification('Image size should be less than 5MB', 'warning');  
      return;  
    }  
      
    const reader = new FileReader();  
    reader.onloadend = () => {  
      const imageData = reader.result;  
      setNewShipment(prev => ({  
        ...prev,  
        image: imageData  
      }));  
      saveImageToStorage(file.name, imageData);  
    };  
    reader.onerror = () => {  
      addNotification('Error reading image file', 'error');  
    };  
    reader.readAsDataURL(file);  
  };  
  
  const saveImageToStorage = (fileName, imageData) => {  
    try {  
      const savedImages = JSON.parse(localStorage.getItem('shipmentImages') || '{}');  
      savedImages[fileName] = imageData;  
      localStorage.setItem('shipmentImages', JSON.stringify(savedImages));  
    } catch (error) {  
      console.error('Error saving image to storage:', error);  
    }  
  };  
  
  const handleRemoveImage = () => {  
    setNewShipment(prev => ({  
      ...prev,  
      image: ""  
    }));  
    try {  
      localStorage.removeItem('shipmentImages');  
    } catch (error) {  
      console.error('Error removing image from storage:', error);  
    }  
  };  
  
  // Form handlers  
  const handleInputChange = (field, value) => {  
    setNewShipment(prev => ({  
      ...prev,  
      [field]: value  
    }));  
  };  
  
  const handleDriverInputChange = (field, value) => {  
    setNewShipment(prev => ({  
      ...prev,  
      driver: {  
        ...prev.driver,  
        [field]: value  
      }  
    }));  
  };  
  
const handleAddShipment = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:8080/api/shipments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
  vehicleType: newShipment.vehicleType.trim(),
  status: newShipment.status,
  origin: newShipment.origin.trim(),
  destination: newShipment.destination.trim(),
  eta: newShipment.eta,
  load: newShipment.load,
  truck: newShipment.truck,
  container: newShipment.container,
  weight: newShipment.weight,
  priority: newShipment.priority,
  image: newShipment.image,
  userId: "admin"
      })
    });

    const result = await response.json();

    if (!result.success) {
      alert(result.message);
      return;
    }

    // update UI with data from backend
    setShipments(prev => [result.data, ...prev]);

    alert("Shipment saved to MongoDB successfully ✅");
    setShowAddForm(false);

  } catch (error) {
    console.error(error);
    alert("Backend error");
  }
};

  
  // Shipment actions  
  const handleDeleteShipment = (shipmentId) => {  
    if (window.confirm("Are you sure you want to delete this shipment?")) {  
      setShipments(shipments.filter(shipment => shipment.id !== shipmentId));  
      addNotification(`Shipment ${shipmentId} deleted successfully`, 'info');  
    }  
  };  
  
  const handleEditShipment = (shipmentId) => {  
    navigate(`/edit-shipment/${shipmentId}?userId=${userId}&role=${role}`);  
  };  
  
  const handleViewDetails = (shipmentId) => {  
    navigate(`/shipment-details/${shipmentId}?userId=${userId}&role=${role}`);  
  };  
  
  // Booking actions  
const handleUpdateBookingStatus = (bookingId, newStatus) => {
  const updatedBookings = bookings.map(booking => 
    booking.id === bookingId ? { ...booking, status: newStatus } : booking
  );

  setBookings(updatedBookings);
  localStorage.setItem('bookings', JSON.stringify(updatedBookings));

  const booking = bookings.find(b => b.id === bookingId);
  if (booking) {
    const statusMsg = newStatus === "Confirmed" ? "confirmed" : "cancelled";
    addNotification(`Booking #${bookingId} has been ${statusMsg}`, 
      newStatus === "Confirmed" ? 'success' : 'error');
  }
};  
  
  const handleDeleteBooking = (bookingId) => {  
    const booking = bookings.find(b => b.id === bookingId);  
      
    if (window.confirm("Are you sure you want to delete this booking?")) {  
      const updatedBookings = bookings.filter(booking => booking.id !== bookingId);  
      setBookings(updatedBookings);  
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));  
      addNotification(`Booking ${bookingId} deleted successfully`, 'info');  
    }  
  };  
  
  // Utility functions  
  const getStatusClass = (status) => {  
    switch (status) {  
      case "In Transit": return "status-transit";  
      case "Delivered": return "status-delivered";  
      case "At Warehouse": return "status-warehouse";  
      case "Scheduled": return "status-scheduled";  
      case "Confirmed": return "status-confirmed";  
      case "Cancelled": return "status-cancelled";  
      default: return "status-scheduled";  
    }  
  };  
  
  const formatDate = (dateString) => {  
    return new Date(dateString).toLocaleDateString('en-US', {  
      year: 'numeric',  
      month: 'short',  
      day: 'numeric',  
      hour: '2-digit',  
      minute: '2-digit'  
    });  
  };  
  
  const getProgressPercentage = (status) => {  
    switch (status) {  
      case "Scheduled": return 0;  
      case "At Warehouse": return 25;  
      case "In Transit": return 50;  
      case "Delivered": return 100;  
      default: return 0;  
    }  
  };  
  
  const getDriverInitials = (driverName) => {  
    if (!driverName) return "DR";  
    return driverName.split(' ').map(n => n[0]).join('').toUpperCase();  
  };  
  
  // Filter shipments based on search term  
  const filteredShipments = shipments.filter(shipment => {  
    if (!searchTerm) return true;  
      
    const searchLower = searchTerm.toLowerCase();  
    return (  
      shipment.id.toLowerCase().includes(searchLower) ||  
      shipment.origin.toLowerCase().includes(searchLower) ||  
      shipment.destination.toLowerCase().includes(searchLower) ||  
      (shipment.driver?.name?.toLowerCase().includes(searchLower)) ||  
      shipment.vehicleType.toLowerCase().includes(searchLower) ||  
      shipment.status.toLowerCase().includes(searchLower)  
    );  
  });  
  
  // Sort search results  
  const sortedShipments = [...filteredShipments].sort((a, b) => {  
    if (!searchTerm) return 0;  
      
    const searchLower = searchTerm.toLowerCase();  
      
    const aOriginExact = a.origin.toLowerCase() === searchLower;  
    const bOriginExact = b.origin.toLowerCase() === searchLower;  
    const aDestExact = a.destination.toLowerCase() === searchLower;  
    const bDestExact = b.destination.toLowerCase() === searchLower;  
      
    if (aOriginExact || aDestExact) return -1;  
    if (bOriginExact || bDestExact) return 1;  
      
    return 0;  
  });  
  
  return (  
    <div className="dashboard-container">  
      {/* Modern Header */}  
      <header className="dashboard-header">  
        <div className="header-left">  
          <h1>Truck wala</h1>  
          <p className="header-subtitle">Admin Dashboard</p>  
        </div>  
        <div className="header-actions">  
          {/* Add New Shipment Button */}  
          {activeTab === 'shipments' && (  
            <button   
              className="btn btn-primary"  
              onClick={() => setShowAddForm(true)}  
            >  
              <i className="fas fa-plus"></i>  
              + New Shipment  
            </button>  
          )}  
  
<div className="notification-badge" onClick={() => setShowNotifications(!showNotifications)}>
  <div className="notification-symbol">
    <img
      src="https://cdn-icons-png.flaticon.com/512/3602/3602145.png"
      alt="notifications"
      className="notification-image"
    />
    {unreadCount > 0 && (
      <span className="notification-count">
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    )}
  </div>

  {showNotifications && (
    <div className="notification-dropdowns">
      <div className="notification-headers">
        <h4>Notifications</h4>
        {notifications.length > 0 && (
          <button className="clear-all-btn" onClick={() => setNotifications([])}>
            Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="no-notifications">No new notifications</div>
      ) : (
        <div className="notifications-list">
          {notifications.slice(0, 8).map((notif) => (
            <div
              key={notification._id}
              className={`notification-item ${notif.read ? 'read' : 'unread'} ${notif.type}`}
              onClick={() => markAsRead(notif.id)}
            >
              <div className="notification-message">{notif.message}</div>
              <div className="notification-time">
                {new Date(notif.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}
</div>

  
           <div className="user-profile">  
            <div className="user-avatar">  
              {userId.charAt(0).toUpperCase()}  
            </div>  
            <div className="user-info">  
              <div className="user-name">{userName}</div>  
              <div className="user-role">{role}</div>  
            </div>  
            <i className="fas fa-chevron-down"></i>  
           </div>  
           <button   
            onClick={() => navigate("/")}   
            className="btn btn-secondarys logout-btn"  
           >  
            <img   
              src="https://cdn-icons-png.flaticon.com/512/126/126467.png"  
              alt="logout icon"  
              className="logout-icon"  
            />  
            Logout  
           </button>  
           </div>  
          </header>  
  
       {/* Statistics Section */}  
       <div className="statistics-grid">  
        <div className="stat-card total" onClick={scrollToShipmentsSection}>  
          <div className="stat-header">  
            <div className="stat-title">Total Shipments</div>  
            <div className="stat-trend trend-up">  
              <i className="fas fa-arrow-up"></i>  
            </div>  
          </div>  
          <div className="stat-value">{totalShipments}</div>  
          <div className="stat-subtitle">Across all locations</div>  
        </div>  
        <div className="stat-card active" onClick={scrollToShipmentsSection}>  
          <div className="stat-header">  
            <div className="stat-title">Active Shipments</div>  
            <div className="stat-trend trend-up">  
              <i className="fas fa-arrow-up"></i>  
            </div>  
          </div>  
          <div className="stat-value">{activeShipments}</div>  
          <div className="stat-subtitle">Currently active</div>  
        </div>  
        <div className="stat-card transit" onClick={scrollToShipmentsSection}>  
          <div className="stat-header">  
            <div className="stat-title">In Transit</div>  
            <div className="stat-trend trend-up">  
              <i className="fas fa-arrow-up"></i>  
            </div>  
          </div>  
          <div className="stat-value">{inTransitCount}</div>  
          <div className="stat-subtitle">On the move</div>  
        </div>  
        <div className="stat-card delivered" onClick={scrollToBookingsSection}>  
          <div className="stat-header">  
            <div className="stat-title">Pending Bookings</div>  
            <div className="stat-trend trend-up">  
              <i className="fas fa-arrow-up"></i>  
            </div>  
          </div>  
          <div className="stat-value">{pendingBookingsForNotification}</div>  
          <div className="stat-subtitle">Need approval</div>  
        </div>  
       </div>  
  
       {/* Search and Actions */}  
       <div className="dashboard-actions">  
        <div className="search-container">  
          <i className="fas fa-search search-icon"></i>  
          <input   
            type="text"   
            className="search-bar"   
            placeholder="Search shipment ID, origin, destination..."  
            value={searchTerm}  
            onChange={(e) => setSearchTerm(e.target.value)}  
          />  
        </div>  
  
        <div className="action-buttons">  
          <div className="filter-dropdown">  
            <button   
              className="filter"  
              onClick={() => setShowFilterOptions(!showFilterOptions)}  
            >  
              <img   
                src="https://cdn-icons-png.flaticon.com/512/566/566737.png"  
                alt="filter"  
                className="filter-icon"  
              />  
            </button>  
  
            {showFilterOptions && (  
              <div className="filter-options">  
                <div onClick={() => { setSearchTerm(""); setShowFilterOptions(false); }}>All</div>  
                <div onClick={() => { setSearchTerm("In Transit"); setShowFilterOptions(false); }}>In Transit</div>  
                <div onClick={() => { setSearchTerm("At Warehouse"); setShowFilterOptions(false); }}>At Warehouse</div>  
                <div onClick={() => { setSearchTerm("Delivered"); setShowFilterOptions(false); }}>Delivered</div>  
              </div>  
            )}  
          </div>  
        </div>  
       </div>  
  
      {/* Admin Tabs */}  
      <div className="dashboard-tabs">  
        <button   
          className={`tab-btn ${activeTab === 'shipments' ? 'active' : ''}`}  
          onClick={() => setActiveTab('shipments')}  
        >  
          Shipments  
          <span className="tab-count">{shipments.length}</span>  
        </button>  
        <button   
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}  
          onClick={() => setActiveTab('bookings')}  
        >  
          Bookings  
          <span className="tab-count">{bookings.length}</span>  
        </button>  
      </div>  
  
      {/* Add Shipment Form */}  
      {showAddForm && (  
        <div className="form-overlay">  
          <div className="form-container">  
            <div className="form-header">  
              <button className="back-btn" onClick={() => setShowAddForm(false)}>  
                <i className="fas fa-arrow-left"></i>  
                Back  
              </button>  
              <h2>Add New Shipment</h2>  
              <div className="form-header-info">  
                <span className="shipment-id-preview">ID: {generateShipmentId()}</span>  
                <button className="save-btn" onClick={handleAddShipment}>  
                  <i className="fas fa-save"></i>  
                  Save Shipment  
                </button>  
              </div>  
            </div>  
  
            <form className="shipment-form">  
              <div className="form-section">  
                <h3>Shipment Image</h3>  
                <div   
                  className={`image-upload-section ${isDragOver ? 'drag-over' : ''}`}  
                  onDragOver={handleDragOver}  
                  onDragLeave={handleDragLeave}  
                  onDrop={handleDrop}  
                  onClick={() => fileInputRef.current?.click()}  
                >  
                  <div className="image-preview">  
                    {newShipment.image ? (  
                      <div className="image-with-actions">  
                        <img src={newShipment.image} alt="Preview" />  
                        <button   
                          type="button"  
                          className="remove-image-btn"  
                          onClick={(e) => {  
                            e.stopPropagation();  
                            handleRemoveImage();  
                          }}  
                          title="Remove image"  
                        >  
                          ×  
                        </button>  
                      </div>  
                    ) : (  
                      <div className="image-placeholder">  
                        <div className="upload-icon">  
                          <i className="fas fa-cloud-upload-alt"></i>  
                        </div>  
                        <span>Drag & Drop or Click to Upload</span>  
                        <small>Supports: JPEG, PNG, GIF (Max 5MB)</small>  
                      </div>  
                    )}  
                  </div>  
                    
                  <input  
                    ref={fileInputRef}  
                    type="file"  
                    accept="image/*"  
                    onChange={(e) => handleImageUpload(e.target.files[0])}  
                    style={{ display: 'none' }}  
                  />  
                    
                  <div className="upload-actions">  
                    {!newShipment.image && (  
                      <button   
                        type="button"   
                        className="browse-btn"  
                        onClick={(e) => {  
                          e.stopPropagation();  
                          fileInputRef.current?.click();  
                        }}  
                      >  
                        <i className="fas fa-folder-open"></i>  
                        Browse Files  
                      </button>  
                    )}  
                  </div>  
                </div>  
              </div>  
  
              <div className="form-section">  
                <h3>Shipment Information</h3>  
                  
                <div className="form-group">  
                  <label>Vehicle Type *</label>  
                  <input  
                    type="text"  
                    value={newShipment.vehicleType}  
                    onChange={(e) => handleInputChange("vehicleType", e.target.value)}  
                    placeholder="Heavy Machinery Transport"  
                    required  
                  />  
                </div>  
  
                <div className="form-group">  
                  <label>Status</label>  
                  <select   
                    value={newShipment.status}  
                    onChange={(e) => handleInputChange("status", e.target.value)}  
                  >  
                    <option value="Scheduled">Scheduled</option>  
                    <option value="In Transit">In Transit</option>  
                    <option value="At Warehouse">At Warehouse</option>  
                    <option value="Delivered">Delivered</option>  
                  </select>  
                </div>  
  
                <div className="form-row">  
                  <div className="form-group">  
                    <label className="required">Origin *</label>  
                    <div className="input-container">  
                      <input  
                        type="text"  
                        value={newShipment.origin}  
                        onChange={(e) => handleOriginChange(e.target.value)}  
                        onFocus={() => setShowOriginSuggestions(true)}  
                        placeholder="Type or select from suggestions"  
                        required  
                      />  
                      {showOriginSuggestions && filteredOriginSuggestions.length > 0 && (  
                        <div className="suggestions">  
                          {filteredOriginSuggestions.map((suggestion, index) => (  
                            <div  
                              key={index}  
                              className="suggestion-item"  
                              onClick={() => selectOriginSuggestion(suggestion)}  
                            >  
                              {suggestion}  
                            </div>  
                          ))}  
                        </div>  
                      )}  
                    </div>  
                  </div>  
  
                  <div className="form-group">  
                    <label className="required">Destination *</label>  
                    <div className="input-container">  
                      <input  
                        type="text"  
                        value={newShipment.destination}  
                        onChange={(e) => handleDestinationChange(e.target.value)}  
                        onFocus={() => setShowDestinationSuggestions(true)}  
                        placeholder="Type or select from suggestions"  
                        required  
                      />  
                      {showDestinationSuggestions && filteredDestinationSuggestions.length > 0 && (  
                        <div className="suggestions">  
                          {filteredDestinationSuggestions.map((suggestion, index) => (  
                            <div  
                              key={index}  
                              className="suggestion-item"  
                              onClick={() => selectDestinationSuggestion(suggestion)}  
                            >  
                              {suggestion}  
                            </div>  
                          ))}  
                        </div>  
                      )}  
                    </div>  
                  </div>  
                </div>  
  
                <div className="form-group">  
                  <label>ETA</label>  
                  <input  
                    type="text"  
                    value={newShipment.eta}  
                    onChange={(e) => handleInputChange("eta", e.target.value)}  
                    placeholder="2 days"  
                    required  
                  />  
                </div>  
  
                <div className="form-group">  
                  <label>Load Description</label>  
                  <input  
                    type="text"  
                    value={newShipment.load}  
                    onChange={(e) => handleInputChange("load", e.target.value)}  
                    placeholder="Construction Equipment"  
                    required  
                  />  
                </div>  
  
                <div className="form-row">  
                  <div className="form-group">  
                    <label>Truck Type</label>  
                    <input  
                      type="text"  
                      value={newShipment.truck}  
                      onChange={(e) => handleInputChange("truck", e.target.value)}  
                      placeholder="Freightliner Cascadia"  
                      required  
                    />  
                  </div>  
  
                  <div className="form-group">  
                    <label>Container</label>  
                    <input  
                      type="text"  
                      value={newShipment.container}  
                      onChange={(e) => handleInputChange("container", e.target.value)}  
                      placeholder="40ft Flatbed"  
                      required  
                    />  
                  </div>  
                </div>  
  
                <div className="form-group">  
                  <label>Weight</label>  
                  <input  
                    type="text"  
                    value={newShipment.weight}  
                    onChange={(e) => handleInputChange("weight", e.target.value)}  
                    placeholder="20,000 kg"  
                    required  
                  />  
                </div>  
  
                <div className="form-group checkbox-group">  
                  <label>  
                    <input  
                      type="checkbox"  
                      checked={newShipment.priority}  
                      onChange={(e) => handleInputChange("priority", e.target.checked)}  
                    />  
                    Priority Shipment  
                  </label>  
                </div>  
              </div>  
            </form>  
          </div>  
        </div>  
      )}  
  
      {/* Shipments Section */}  
      {activeTab === 'shipments' && (  
        <div className="shipments-section" ref={shipmentsSectionRef}>  
          <div className="section-header">  
            <h2 className="section-title">  
              All Shipments ({sortedShipments.length})  
            </h2>  
            <div className="section-actions">  
              <button className="btn btn-secondary">  
                <i className="fas fa-sync-alt"></i>  
                Refresh  
              </button>  
            </div>  
          </div>  
            
          {sortedShipments.length === 0 ? (  
            <div className="empty-state">  
              <p>No shipments found. Create your first shipment to get started!</p>  
            </div>  
          ) : (  
            <div className="shipments-grid">  
              {sortedShipments.map(shipment => (  
                <div key={shipment.id} className="shipment-card">  
                  <div className="shipment-header">  
                    <div>  
                      <div className="shipment-id">{shipment.id}</div>  
                      <div className="shipment-type">{shipment.vehicleType}</div>  
                    </div>  
                    <span className={`status-badge ${getStatusClass(shipment.status)}`}>  
                      {shipment.status}  
                    </span>  
                  </div>  
                    
                  {shipment.priority && (  
                    <div className="priority-flag priority-high">  
                      High Priority  
                    </div>  
                  )}  
                    
                  {shipment.image && (  
                    <div className="shipment-image-section">  
                      <img   
                        src={shipment.image}   
                        alt="Shipment"   
                        className="shipment-image"  
                      />  
                    </div>  
                  )}  
                    
                  <div className="shipment-content">  
                    <div className="route-info">  
                      <div className="origin">  
                        <div className="location-label">Origin</div>  
                        <div className="location-value">{shipment.origin}</div>  
                      </div>  
                      <div className="route-arrow">  
                        <i className="fas fa-arrow-right"></i>  
                      </div>  
                      <div className="destination">  
                        <div className="location-label">Destination</div>  
                        <div className="location-value">{shipment.destination}</div>  
                      </div>  
                    </div>  
                      
                    <div className="progress-section">  
                      <div className="progress-header">  
                        <div className="progress-label">Delivery Progress</div>  
                        <div className="progress-value">{getProgressPercentage(shipment.status)}%</div>  
                      </div>  
                      <div className="progress-bar">  
                        <div   
                          className="progress-fill"   
                          style={{ width: `${getProgressPercentage(shipment.status)}%` }}  
                        ></div>  
                      </div>  
                    </div>  
                      
                    <div className="shipment-details">  
                      <div className="detail-item">  
                        <div className="detail-label">Items</div>  
                        <div className="detail-value">{shipment.load || 'N/A'}</div>  
                      </div>  
                      <div className="detail-item">  
                        <div className="detail-label">Weight</div>  
                        <div className="detail-value">{shipment.weight || 'N/A'}</div>  
                      </div>  
                      <div className="detail-item">  
                        <div className="detail-label">Vehicle</div>  
                        <div className="detail-value">{shipment.truck || 'N/A'}</div>  
                      </div>  
                      <div className="detail-item">  
                        <div className="detail-label">ETA</div>  
                        <div className="detail-value">{shipment.eta || 'N/A'}</div>  
                      </div>  
                    </div>  
                      
                    {shipment.driver && shipment.driver.name && (  
                      <div className="driver-info">  
                        <div className="driver-avatar">  
                          {getDriverInitials(shipment.driver.name)}  
                        </div>  
                        <div className="driver-details">  
                          <div className="driver-name">{shipment.driver.name}</div>  
                          <div className="driver-contact">{shipment.driver.phone || 'No contact'}</div>  
                        </div>  
                        {shipment.driver.phone && (  
                          <button className="contact-btn">  
                            <i className="fas fa-phone"></i>  
                          </button>  
                        )}  
                      </div>  
                    )}  
                      
                    <div className="shipment-actions">  
                      <button   
                        className="action-btn primary"  
                        onClick={() => handleViewDetails(shipment.id)}  
                      >  
                        <i className="fas fa-info-circle"></i>  
                        Details  
                      </button>  
                        
                      <button   
                        className="action-btn secondary"  
                        onClick={() => handleEditShipment(shipment.id)}  
                      >  
                        <i className="fas fa-edit"></i>  
                        Edit  
                      </button>  
                      <button   
                        className="action-btn danger"  
                        onClick={() => handleDeleteShipment(shipment.id)}  
                      >  
                        <i className="fas fa-trash"></i>  
                        Delete  
                      </button>  
                    </div>  
                      
                    <div className="update-time">  
                      Created: {formatDate(shipment.createdAt)}  
                    </div>  
                  </div>  
                </div>  
              ))}  
            </div>  
          )}  
        </div>  
      )}  
  
      {/* Bookings Section */}  
      {activeTab === 'bookings' && (  
        <div className="bookings-section" ref={bookingsSectionRef}>  
          <div className="section-header">  
            <h2 className="section-title">All Bookings ({bookings.length})</h2>  
          </div>  
            
          {bookings.length === 0 ? (  
            <div className="empty-state">  
              <p>No bookings found yet.</p>  
            </div>  
          ) : (  
            <div className="bookings-grid">  
              {bookings.map(booking => (  
                <div key={booking.id} className={`booking-card status-${booking.status.toLowerCase()}`}>  
                  <div className="booking-header">  
                    <h3>Booking #{booking.id}</h3>  
                    <span className={`status-badge ${getStatusClass(booking.status)}`}>  
                      {booking.status}  
                    </span>  
                  </div>  
                    
                  <div className="booking-info">  
                    <div><strong>User:</strong> {booking.userName} ({booking.userPhone})</div>  
                    <div><strong>CONTAINER:</strong> {booking.shipmentDetails?.vehicleType || "N/A"}</div>  
                    <div><strong>VEHICLE NAME :</strong> {booking.shipmentDetails?.vehicleNumber || "N/A"}</div>  
                    <div className="booking-route">  
                      <span className="origin">{booking.shipmentDetails?.origin || "N/A"}</span>  
                      <span className="arrow">→</span>  
                      <span className="destination">{booking.shipmentDetails?.destination || "N/A"}</span>  
                    </div>  
                    <div><strong>Booked:</strong> {formatDate(booking.bookedAt)}</div>  
                  </div>  
  
                  <div className="booking-actions">  
                    {booking.status === "Pending" && (  
                      <>  
                        <button   
                          className="btn-confirm"  
                          onClick={() => handleUpdateBookingStatus(booking.id, "Confirmed")}  
                        >  
                          Confirm  
                        </button>  
                        <button   
                          className="btn-cancel"  
                          onClick={() => handleUpdateBookingStatus(booking.id, "Cancelled")}  
                        >  
                          Cancel  
                        </button>  
                      </>  
                    )}  
                    <button   
                      className="btn-delete"  
                      onClick={() => handleDeleteBooking(booking.id)}  
                    >  
                      Delete  
                    </button>  
                  </div>  
                </div>  
              ))}  
            </div>  
          )}  
        </div>  
      )}  
    </div>  
  );  
}  
