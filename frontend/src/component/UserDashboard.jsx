import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { shipmentAPI, bookingAPI, userNotificationAPI } from "../utils/api";
import { io } from "socket.io-client";
import "../styles/user-dashboard-main.css";

import AvailableShipmentsSection from "./AvailableShipmentsSection";
import MyBookingsSection from "./MyBookingsSection";
import UserNotification from "./UserNotification";
import ToastNotification from "./ToastNotification";

export default function UserDashboard() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get("role") || "user";

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const userId = currentUser._id || currentUser.id || "guest";
  const userName = currentUser.name || "User";

  // Language state
  const [currentLang, setCurrentLang] = useState(i18n.language || "en");

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setCurrentLang(lng);
  };

  /* =========================
     DATA STATE
  ========================= */
  const [shipments, setShipments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔔 NOTIFICATIONS STATE */
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  /* =========================
     SOCKET.IO SETUP
  ========================= */
  const socketRef = useRef(null);

  useEffect(() => {
    if (userId && userId !== "guest") {
      // Initialize socket connection with error handling
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      
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
          console.log('Socket connected, userId:', userId);
          // Join user room
          const userIdStr = userId?.toString() || userId;
          console.log('Joining user room:', `user-${userIdStr}`);
          socketRef.current.emit('join-user-room', userIdStr);
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
              // Handle both shipmentId in data and direct shipmentId property
              const dataShipmentId = data.shipmentId || data.id;
              if (shipmentId?.toString() === dataShipmentId?.toString()) {
                return {
                  ...shipment,
                  isBooked: data.isBooked || false,
                  bookedBy: data.bookedBy || null,
                  bookingStatus: data.bookingStatus || null,
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
          
          // Refresh shipments when booking status changes to update isBooked status
          shipmentAPI.getAvailable()
            .then(res => setShipments(res.data))
            .catch(err => console.error('Error refreshing shipments after booking update:', err));
        });

        // Listen for user notifications
        socketRef.current.on('new-notification', (notification) => {
          console.log('Received new notification via socket:', notification);
          setNotifications((prev) => {
            // Check if notification already exists to prevent duplicates
            const exists = prev.some(n => {
              const nId = n._id || n.id;
              const notifId = notification._id || notification.id;
              return nId?.toString() === notifId?.toString();
            });
            if (exists) {
              console.log('Notification already exists, skipping');
              return prev;
            }
            return [notification, ...prev];
          });
          // Show toast popup for 5 seconds
          setToastNotification({
            ...notification,
            message: notification.msg || notification.message || notification.title || "New notification",
            type: notification.notificationType || notification.type || "info",
            msgKey: notification.msgKey,
            params: notification.params
          });
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
    }
  }, [userId]);

  /* =========================
     LOAD DATA FROM API
========================= */
  const loadNotifications = async () => {
    try {
      const notificationsRes = await userNotificationAPI.getAll();
      setNotifications(notificationsRes.data || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [shipmentsRes, bookingsRes, notificationsRes] = await Promise.all([
          shipmentAPI.getAvailable(),
          bookingAPI.getAll(),
          userNotificationAPI.getAll(),
        ]);
        setShipments(shipmentsRes.data);
        setBookings(bookingsRes.data);
        setNotifications(notificationsRes.data);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId && userId !== "guest") {
      loadData();
    }
  }, [userId]);

  // Listen for refresh notifications event
  useEffect(() => {
    const handleRefreshNotifications = () => {
      console.log('Refreshing notifications...');
      loadNotifications();
    };

    window.addEventListener('refresh-notifications', handleRefreshNotifications);
    return () => {
      window.removeEventListener('refresh-notifications', handleRefreshNotifications);
    };
  }, []);


  /* =========================
     SYNC LANGUAGE ON MOUNT
  ========================= */
  useEffect(() => {
    setCurrentLang(i18n.language);
  }, []);

  /* =========================
     ADD NOTIFICATION HELPER
  ========================= */
  const addNotification = (msgKeyOrMessage, params = {}, type = "info") => {
    // Check if it's a translation key (contains dot) or a plain message
    const isTranslationKey = typeof msgKeyOrMessage === 'string' && msgKeyOrMessage.includes('.');
    
    const newNotification = {
      id: Date.now(),
      msgKey: isTranslationKey ? msgKeyOrMessage : undefined,
      message: isTranslationKey ? undefined : msgKeyOrMessage,
      params,
      type,
      time: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
    
    // Show toast popup for 5 seconds
    setToastNotification({
      msgKey: isTranslationKey ? msgKeyOrMessage : undefined,
      message: isTranslationKey ? undefined : msgKeyOrMessage,
      params,
      type,
    });
    
    setShowNotifications(true);
  };

  /* =========================
     DERIVED DATA
  ========================= */
  // Filter user bookings and remove duplicates
  const userBookings = bookings
    .filter((b) => {
      const bookingUserId = b.userId?._id || b.userId?.id || b.userId;
      return bookingUserId === userId || bookingUserId?.toString() === userId?.toString();
    })
    .filter((b, index, self) => {
      // Remove duplicates based on _id
      const id = b._id || b.id;
      return id && index === self.findIndex((booking) => (booking._id || booking.id)?.toString() === id?.toString());
    });

  const availableCount = shipments.filter(
    (s) => !["Delivered", "Cancelled"].includes(s.status)
  ).length;

  const pendingCount = userBookings.filter((b) => b.status === "Pending").length;
  const confirmedCount = userBookings.filter((b) => b.status === "Confirmed").length;

  const avatarInitial = userName.charAt(0).toUpperCase();

  /* =========================
     REFS FOR NAVIGATION
  ========================= */
  const availableShipmentsRef = useRef(null);
  const myBookingsRef = useRef(null);

  /* =========================
     NAVIGATION HANDLERS
  ========================= */
  const scrollToAvailableShipments = () => {
    availableShipmentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToMyBookings = () => {
    myBookingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="user-dashboard-container">
      {/* Toast Notification Popup */}
      {toastNotification && (
        <ToastNotification
          notification={toastNotification}
          onClose={() => setToastNotification(null)}
        />
      )}
      {/* ================= HEADER ================= */}
      <header className="user-dashboard-header">
        <div className="user-header-left">
          <h1>{t("app.name")}</h1>
          <p className="user-header-subtitle">
            {t("userDashboard.title")} • {t("userDashboard.welcome")}, {userName}!
          </p>
        </div>

        <div className="user-header-center">
          {/* LANGUAGE SELECTOR */}
          <select
            value={currentLang}
            onChange={(e) => changeLanguage(e.target.value)}
            className="lang-select"
          >
            <option value="en">{t("languages.en")}</option>
            <option value="hi">{t("languages.hi")}</option>
            <option value="ta">{t("languages.ta")}</option>
            <option value="te">{t("languages.te")}</option>
          </select>
        </div>

        <div className="user-header-actions">
          {/* 🔔 NOTIFICATION BELL */}
          <UserNotification
            notifications={notifications}
            setNotifications={setNotifications}
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
          />

          {/* USER PROFILE */}
          <div className="user-profile">
            <div className="user-avatar">{avatarInitial}</div>
            <div className="user-info">
              <div className="user-name">{userName}</div>
              <div className="user-role">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </div>
            </div>
          </div>

          {/* LOGOUT BUTTON */}
          <button onClick={() => navigate("/")} className="user-logout-btn">
            <img
              src="https://cdn-icons-png.flaticon.com/512/126/126467.png"
              alt={t("common.logout")}
              className="user-logout-icon"
            />
            {t("common.logout")}
          </button>
        </div>
      </header>

      {/* ================= STATISTICS ================= */}
      {loading ? (
        <div className="user-loading">Loading...</div>
      ) : (
        <div className="user-statistics-grid">
          <div className="user-stat-card" onClick={scrollToAvailableShipments}>
            <div className="user-stat-title">{t("userDashboard.availableShipments")}</div>
            <div className="user-stat-value">{availableCount}</div>
          </div>
          <div className="user-stat-card" onClick={scrollToMyBookings}>
            <div className="user-stat-title">{t("userDashboard.myBookings")}</div>
            <div className="user-stat-value">{userBookings.length}</div>
          </div>
          <div className="user-stat-card" onClick={scrollToMyBookings}>
            <div className="user-stat-title">{t("userDashboard.confirmed")}</div>
            <div className="user-stat-value">{confirmedCount}</div>
          </div>
          <div className="user-stat-card" onClick={scrollToMyBookings}>
            <div className="user-stat-title">{t("userDashboard.pending")}</div>
            <div className="user-stat-value">{pendingCount}</div>
          </div>
        </div>
      )}

      {/* ================= AVAILABLE SHIPMENTS ================= */}
      <div ref={availableShipmentsRef}>
        <AvailableShipmentsSection
          userId={userId}
          userName={userName}
          shipments={shipments}
          bookings={bookings}
          setBookings={setBookings}
          setShipments={setShipments}
          navigate={navigate}
          addNotification={addNotification}
          notifications={notifications}
          setNotifications={setNotifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
        />
      </div>

      {/* ================= MY BOOKINGS ================= */}
      <div ref={myBookingsRef}>
        <MyBookingsSection
          userBookings={userBookings}
          bookings={bookings}
          setBookings={setBookings}
          onBookingDeleted={async () => {
            // Refresh shipments to update booking status
            try {
              const shipmentsRes = await shipmentAPI.getAvailable();
              setShipments(shipmentsRes.data);
            } catch (error) {
              console.error("Error refreshing shipments after booking deletion:", error);
            }
            // Also refresh bookings
            try {
              const bookingsRes = await bookingAPI.getAll();
              setBookings(bookingsRes.data);
            } catch (error) {
              console.error("Error refreshing bookings after deletion:", error);
            }
          }}
        />
      </div>
    </div>
  );
}