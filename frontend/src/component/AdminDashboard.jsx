import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../styles/admin-dashboard.css";
import { useTranslation } from "react-i18next";
import { shipmentAPI, bookingAPI, adminNotificationAPI } from "../utils/api";
import { io } from "socket.io-client";


import ShipmentsSection from "./ShipmentsSection";
import BookingsSection from "./BookingsSection";
import ToastNotification from "./ToastNotification";

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get("role") || "admin";

  const { t, i18n } = useTranslation();

  const [activeTab, setActiveTab] = useState("shipments");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Refs for scrolling to sections
  const shipmentsSectionRef = useRef(null);
  const bookingsSectionRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const userName = currentUser.name || "Admin";
  const userId = currentUser.id || "admin";

/* =========================
   LANGUAGE (GLOBAL)
========================= */
const currentLang = i18n.language || "en";

const changeLanguage = (lng) => {
  i18n.changeLanguage(lng);
  localStorage.setItem("i18nextLng", lng);
};


  useEffect(() => {
    i18n.changeLanguage(currentLang);
  }, [currentLang, i18n]);

  /* =========================
     STATE (API)
  ========================= */
  const [shipments, setShipments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  /* =========================
     SOCKET.IO SETUP
  ========================= */
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection with error handling
    const socketUrl = import.meta.env.VITE_SOCKET_URL || `${BASE_URL}`;
    
    try {
      socketRef.current = io(socketUrl, {
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });

      // Handle connection events
      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        // Join admin room
        socketRef.current.emit('join-admin-room');
      });

      socketRef.current.on('connect_error', (error) => {
        console.warn('Socket connection error:', error);
        // Don't show error to user, just log it
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      // Listen for booking status changes
      socketRef.current.on('shipment-booking-status', (data) => {
        // Update shipments with new booking status
        setShipments((prevShipments) =>
          prevShipments.map((shipment) => {
            const shipmentId = shipment._id || shipment.id;
            if (shipmentId?.toString() === data.shipmentId?.toString()) {
              return {
                ...shipment,
                isBooked: data.isBooked,
                bookedBy: data.bookedBy,
                bookingStatus: data.bookingStatus,
              };
            }
            return shipment;
          })
        );
      });

      // Listen for booking updates
      socketRef.current.on('booking-update', (booking) => {
        setBookings((prevBookings) => {
          const bookingId = booking._id || booking.id;
          const existingIndex = prevBookings.findIndex(
            (b) => (b._id || b.id)?.toString() === bookingId?.toString()
          );
          if (existingIndex >= 0) {
            const updated = [...prevBookings];
            updated[existingIndex] = booking;
            return updated;
          }
          return [...prevBookings, booking];
        });
      });

      // Listen for admin notifications
      socketRef.current.on('new-admin-notification', (notification) => {
        console.log('Admin notification received:', notification);
        // Add to notifications list
        setNotifications((prev) => [notification, ...prev]);
        // Show toast popup for 5 seconds
        const toastData = {
          ...notification,
          message: notification.message || notification.title || "New notification",
          msgKey: notification.msgKey,
          params: notification.params || {},
          type: notification.notificationType || notification.type || "info"
        };
        console.log('Setting toast notification:', toastData);
        setToastNotification(toastData);
      });
    } catch (error) {
      console.error('Error initializing socket:', error);
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  /* =========================
     LOAD DATA FROM API
  ========================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load shipments and bookings (these don't require admin role)
        const [shipmentsRes, bookingsRes] = await Promise.all([
          shipmentAPI.getAll().catch(() => ({ data: [] })),
          bookingAPI.getAll().catch(() => ({ data: [] })),
        ]);
        
        setShipments(shipmentsRes.data || []);
        setBookings(bookingsRes.data || []);

        // Try to load admin notifications (requires admin role)
        try {
          const notificationsRes = await adminNotificationAPI.getAll();
          setNotifications(notificationsRes.data || []);
        } catch (notifError) {
          // If not admin or no token, just set empty array
          if (notifError.response?.status === 403 || notifError.response?.status === 401) {
            setNotifications([]);
          } else {
            console.error("Error loading notifications:", notifError);
            setNotifications([]);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* =========================
     NOTIFICATIONS
  ========================= */
  const addNotification = (message, type = "info") => {
    const newNotif = {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setShowNotifications(true);
  };

  const markAsRead = async (id) => {
    try {
      // Update local state immediately
      setNotifications((prev) =>
        prev.map((n) => {
          const nId = n._id || n.id;
          return (nId === id || nId?.toString() === id?.toString()) ? { ...n, read: true } : n;
        })
      );
      
      // Update on server if it's an API notification
      if (id && typeof id === 'string' && id.length > 10) {
        try {
          await adminNotificationAPI.markAsRead(id);
        } catch (err) {
          console.error('Error marking notification as read:', err);
        }
      }
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (notifications.length === 0) return;
    
    if (!window.confirm(t("notifications.confirmClearAll") || "Are you sure you want to delete all notifications?")) {
      return;
    }

    try {
      await adminNotificationAPI.deleteAll();
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
      alert(error.response?.data?.message || t("notifications.clearAllFailed") || "Failed to clear notifications");
    }
  };

  /* =========================
     DELETE SHIPMENT
  ========================= */
  const handleDeleteShipment = async (shipmentId) => {
    if (!window.confirm(t("shipments.deleteConfirm"))) {
      return;
    }

    try {
      await shipmentAPI.delete(shipmentId);
      setShipments((prev) => prev.filter((s) => {
        const id = s._id || s.id;
        return id !== shipmentId && id?.toString() !== shipmentId?.toString();
      }));

      setBookings((prev) =>
        prev.map((b) => {
          const bid = b.shipmentId?._id || b.shipmentId?.id || b.shipmentId;
          return bid === shipmentId || bid?.toString() === shipmentId?.toString()
            ? { ...b, status: "Cancelled" }
            : b;
        })
      );

      addNotification(
        t("shipments.deletedMessage", { id: shipmentId }),
        "warning"
      );
    } catch (error) {
      console.error("Error deleting shipment:", error);
      addNotification(
        error.response?.data?.message || t("shipments.deleteFailed"),
        "error"
      );
    }
  };

  /* =========================
     STATS
  ========================= */
  const totalShipments = shipments.length;
  const activeShipments = shipments.filter(
    (s) => !["Delivered", "Cancelled"].includes(s.status)
  ).length;
  const inTransitCount = shipments.filter(
    (s) => s.status === "In Transit"
  ).length;
  const pendingBookingsCount = bookings.filter(
    (b) => b.status === "Pending"
  ).length;

  /* =========================
     NAVIGATE TO SECTIONS
  ========================= */
  const navigateToShipments = () => {
    setActiveTab("shipments");
    setTimeout(() => {
      shipmentsSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  const navigateToBookings = () => {
    setActiveTab("bookings");
    setTimeout(() => {
      bookingsSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="dashboard-container">
      {/* Toast Notification Popup */}
      {toastNotification && (
        <ToastNotification
          notification={toastNotification}
          onClose={() => setToastNotification(null)}
        />
      )}
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>{t("dashboard.title")}</h1>
          <p className="header-subtitle">{t("dashboard.subtitle")}</p>
        </div>

        {/* LANGUAGE SELECTOR */}
        <select
          value={currentLang}
          onChange={(e) => changeLanguage(e.target.value)}
          className="lang-select"
        >
          <option value="en">{t("ENGLISH")}</option>
          <option value="hi">{t("हिंदी")}</option>
          <option value="ta">{t("தமிழ்")}</option>
          <option value="te">{t("తెలుగు")}</option>
        </select>

        <div className="header-actions">
          {/* NOTIFICATIONS */}
          <div
            className="notification-badge"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <img src="/notification.png" alt="notifications" width="28" />
            {unreadCount > 0 && (
              <span className="notification-count">{unreadCount}</span>
            )}

            {showNotifications && (
              <div className="notification-dropdowns">
                <div className="notification-headers">
                  <h4>
                    {t("notifications.title", { count: unreadCount })}
                  </h4>

                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="clear-all-btn"
                    >
                      {t("notifications.clearAll")}
                    </button>
                  )}
                </div>

                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">
                      {t("notifications.empty")}
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((n, index) => (
                      <div
                        key={n._id || n.id || `notification-${index}`}
                        className={`notification-item ${
                          n.read ? "read" : "unread"
                        } ${n.type || ""}`}
                        onClick={() => markAsRead(n._id || n.id)}
                      >
                        <div className="notification-message">
                          {n.msgKey
                            ? (() => {
                                try {
                                  const translated = t(n.msgKey, n.params || {});
                                  // If translation returns the key itself, it means translation failed
                                  return translated === n.msgKey ? (n.message || n.msg || n.msgKey) : translated;
                                } catch (error) {
                                  console.error('Translation error:', error);
                                  return n.message || n.msg || n.msgKey;
                                }
                              })()
                            : n.message || n.msg || n.title}
                        </div>
                        <div className="notification-time">
                          {(() => {
                            try {
                              const date = new Date(n.timestamp || n.createdAt || n.time);
                              if (isNaN(date.getTime())) return "";
                              return date.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                              });
                            } catch {
                              return "";
                            }
                          })()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* USER */}
          <div className="user-profile">
            <div className="user-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="user-role">{role}</div>
          </div>

          {/* LOGOUT */}
          <button onClick={() => navigate("/")} className="logout-btn">
            {t("dashboard.logout")}
          </button>
        </div>
      </header>

      {/* STATS */}
      <div className="statistics-grid">
        <div 
          className="stat-card total" 
          onClick={navigateToShipments}
        >
          <div className="stat-title">{t("stats.totalShipments")}</div>
          <div className="stat-value">{totalShipments}</div>
        </div>
        <div 
          className="stat-card active" 
          onClick={navigateToShipments}
        >
          <div className="stat-title">{t("stats.activeShipments")}</div>
          <div className="stat-value">{activeShipments}</div>
        </div>
        <div 
          className="stat-card transit" 
          onClick={navigateToShipments}
        >
          <div className="stat-title">{t("stats.inTransit")}</div>
          <div className="stat-value">{inTransitCount}</div>
        </div>
        <div 
          className="stat-card delivered" 
          onClick={navigateToBookings}
        >
          <div className="stat-title">{t("stats.pendingBookings")}</div>
          <div className="stat-value">{pendingBookingsCount}</div>
        </div>
      </div>

      {/* SEARCH */}
      <input
        className="search-bar"
        placeholder={t("dashboard.searchPlaceholder")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* TABS */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === "shipments" ? "active" : ""}
          onClick={() => setActiveTab("shipments")}
        >
          {t("tabs.shipments")} ({totalShipments})
        </button>

        <button
          className={activeTab === "bookings" ? "active" : ""}
          onClick={() => setActiveTab("bookings")}
        >
          {t("tabs.bookings")} ({bookings.length})
        </button>
      </div>

      {/* SECTIONS */}
      {activeTab === "shipments" && (
        <ShipmentsSection
          ref={shipmentsSectionRef}
          shipments={shipments}
          setShipments={setShipments}
          searchTerm={searchTerm}
          addNotification={addNotification}
          navigate={navigate}
          userId={userId}
          role={role}
          onDeleteShipment={handleDeleteShipment}
        />
      )}

      {activeTab === "bookings" && (
        <BookingsSection
          ref={bookingsSectionRef}
          bookings={bookings}
          setBookings={setBookings}
          addNotification={addNotification}
          onBookingDeleted={async () => {
            // Refresh shipments to update booking status
            try {
              const shipmentsRes = await shipmentAPI.getAll();
              setShipments(shipmentsRes.data || []);
            } catch (error) {
              console.error("Error refreshing shipments after booking deletion:", error);
            }
            // Also refresh bookings
            try {
              const bookingsRes = await bookingAPI.getAll();
              setBookings(bookingsRes.data || []);
            } catch (error) {
              console.error("Error refreshing bookings after deletion:", error);
            }
          }}
        />
      )}
    </div>
  );
}
