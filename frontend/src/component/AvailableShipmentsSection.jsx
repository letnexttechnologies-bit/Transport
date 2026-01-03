import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { bookingAPI, userNotificationAPI, shipmentAPI, getImageUrl } from "../utils/api";
import { reverseGeocode } from "../utils/geolocation";
import "../styles/user-shipments-section.css";

const PLACEHOLDER_IMG = "/Truck Images.jpeg";

// Full Indian Cities Database with State Information
const indianCities = {
  Chennai: { latitude: 13.0827, longitude: 80.2707, state: 'Tamil Nadu' },
  Coimbatore: { latitude: 11.0168, longitude: 76.9558, state: 'Tamil Nadu' },
  Madurai: { latitude: 9.9252, longitude: 78.1198, state: 'Tamil Nadu' },
  Tiruppur: { latitude: 11.1085, longitude: 77.3411, state: 'Tamil Nadu' },
  Salem: { latitude: 11.6643, longitude: 78.1460, state: 'Tamil Nadu' },
  Erode: { latitude: 11.3410, longitude: 77.7172, state: 'Tamil Nadu' },
  Tiruchirappalli: { latitude: 10.7905, longitude: 78.7047, state: 'Tamil Nadu' },
  Vellore: { latitude: 12.9165, longitude: 79.1325, state: 'Tamil Nadu' },
  Thoothukudi: { latitude: 8.7642, longitude: 78.1348, state: 'Tamil Nadu' },
  Dindigul: { latitude: 10.3629, longitude: 77.9757, state: 'Tamil Nadu' },
  Thanjavur: { latitude: 10.7869, longitude: 79.1378, state: 'Tamil Nadu' },
  Bangalore: { latitude: 12.9716, longitude: 77.5946, state: 'Karnataka' },
  Mysore: { latitude: 12.2958, longitude: 76.6394, state: 'Karnataka' },
  Mumbai: { latitude: 19.0760, longitude: 72.8777, state: 'Maharashtra' },
  Pune: { latitude: 18.5204, longitude: 73.8567, state: 'Maharashtra' },
  Delhi: { latitude: 28.7041, longitude: 77.1025, state: 'Delhi' },
  Hyderabad: { latitude: 17.3850, longitude: 78.4867, state: 'Telangana' },
  Kolkata: { latitude: 22.5726, longitude: 88.3639, state: 'West Bengal' },
  Ahmedabad: { latitude: 23.0225, longitude: 72.5714, state: 'Gujarat' },
  Jaipur: { latitude: 26.9124, longitude: 75.7873, state: 'Rajasthan' },
  Lucknow: { latitude: 26.8467, longitude: 80.9462, state: 'Uttar Pradesh' },
  // Add more cities as needed
};

// Distance calculation (unchanged)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get city coordinates (fuzzy match)
const getCityCoordinates = (cityName) => {
  if (!cityName) return null;
  const name = cityName.trim().toLowerCase();
  for (const [city, coords] of Object.entries(indianCities)) {
    if (city.toLowerCase().includes(name) || name.includes(city.toLowerCase())) {
      return coords;
    }
  }
  return null;
};

export default function AvailableShipmentsSection({
  userId,
  userName,
  shipments = [],
  bookings = [],
  navigate,
  setBookings,
  setShipments,
  addNotification,
}) {
  // Get current user ID from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const currentUserId = currentUser._id || currentUser.id || userId;
  const { t } = useTranslation(); // ← i18n hook

  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [userLocationName, setUserLocationName] = useState("");
  const [userLocationState, setUserLocationState] = useState("");
  const [nearbyCount, setNearbyCount] = useState(0);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(new Set()); // Track bookings in progress
  const [nearbyNotificationSent, setNearbyNotificationSent] = useState(false); // Track if notification already sent

  const prefs = { proximityAlerts: true, threshold: 50 };

  // Get user location
  const getLocation = () => {
    if (!("geolocation" in navigator)) {
      addNotification(t("availableShipments.geolocationNotSupported"), "warning");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(loc);
        
        // Reset notification sent flag when location changes
        setNearbyNotificationSent(false);
        
        // Use reverse geocoding to get accurate location details including state
        try {
          const locationData = await reverseGeocode(loc.lat, loc.lng);
          await findNearestCityAndCheckNearby(loc, locationData);
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          // Fallback to basic city matching if reverse geocoding fails
          await findNearestCityAndCheckNearby(loc, null);
        }
        
        setIsGettingLocation(false);
        // Don't show success notification - only show nearby shipments notification
      },
      (error) => {
        setIsGettingLocation(false);

        let message = t("availableShipments.locationError");
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = t("availableShipments.permissionDenied");
            break;
          case error.POSITION_UNAVAILABLE:
            message = t("availableShipments.positionUnavailable");
            break;
          case error.TIMEOUT:
            message = t("availableShipments.timeout");
            break;
        }
        addNotification(message, "error");
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000, // Accept cached location if less than 1 minute old
      }
    );
  };

  // Find nearest city and count nearby shipments
  const findNearestCityAndCheckNearby = async (loc, locationData = null) => {
    let nearestCity = "";
    let minDistance = Infinity;
    let state = "";

    // Use reverse geocoding data if available (more accurate)
    if (locationData) {
      if (locationData.city) {
        nearestCity = locationData.city;
        // Try to find distance to known city
        const cityCoords = getCityCoordinates(locationData.city);
        if (cityCoords) {
          minDistance = calculateDistance(loc.lat, loc.lng, cityCoords.latitude, cityCoords.longitude);
        } else {
          minDistance = 0; // Exact match from reverse geocoding
        }
      } else if (locationData.name) {
        nearestCity = locationData.name;
        minDistance = 0;
      }
      
      // Get state from reverse geocoding
      if (locationData.state) {
        state = locationData.state;
        setUserLocationState(state);
      }
    }

    // Fallback: Find nearest city from database if reverse geocoding didn't provide city
    if (!nearestCity) {
      for (const [city, coords] of Object.entries(indianCities)) {
        const dist = calculateDistance(loc.lat, loc.lng, coords.latitude, coords.longitude);
        if (dist < minDistance) {
          minDistance = dist;
          nearestCity = city;
        }
      }
      
      // Get state from city database if available
      const cityData = indianCities[nearestCity];
      if (cityData && cityData.state) {
        state = cityData.state;
        setUserLocationState(state);
      }
    }

    // Format location text with state information
    let locationText = "";
    if (nearestCity && minDistance < 100) {
      // Show city name, state, and distance if within 100km
      if (state) {
        locationText = `${nearestCity}, ${state} (${minDistance.toFixed(1)} km)`;
      } else {
        locationText = `${nearestCity} (${minDistance.toFixed(1)} km)`;
      }
    } else if (nearestCity) {
      // Show city name and state if found but far
      if (state) {
        locationText = `${nearestCity}, ${state} (${minDistance.toFixed(1)} km away)`;
      } else {
        locationText = `${nearestCity} (${minDistance.toFixed(1)} km away)`;
      }
    } else {
      // Show coordinates if no city found
      if (state) {
        locationText = `${state} (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`;
      } else {
        locationText = `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
      }
    }

    setUserLocationName(locationText);

    let count = 0;
    shipments.forEach((s) => {
      if (["Delivered", "Cancelled"].includes(s.status)) return;
      const coords = getCityCoordinates(s.origin);
      if (coords) {
        const dist = calculateDistance(loc.lat, loc.lng, coords.latitude, coords.longitude);
        if (dist <= prefs.threshold) count++;
      }
    });

    setNearbyCount(count);
    if (count > 0) {
      // Show toast notification
      addNotification(
        t("availableShipments.nearbyFound", { count, s: count > 1 ? "s" : "" }),
        "info"
      );
      
      // Create persistent notification in user notification system (only once per location session)
      if (!nearbyNotificationSent && currentUserId && currentUserId !== "guest") {
        try {
          const response = await userNotificationAPI.create({
            type: 'shipment',
            title: t("notifications.user.nearbyShipments.title") || 'Nearby Shipments Found',
            message: t("notifications.user.nearbyShipments.message", { count, s: count > 1 ? "s" : "" }) || `Found ${count} shipment${count > 1 ? "s" : ""} nearby your location!`,
            msgKey: 'notifications.user.nearbyShipments.message',
            params: {
              count,
              s: count > 1 ? "s" : ""
            },
            priority: 'medium',
            notificationType: 'info',
          });
          
          console.log('Nearby shipment notification created successfully:', response.data);
          setNearbyNotificationSent(true);
          
          // Trigger a custom event to refresh notifications in UserDashboard
          window.dispatchEvent(new CustomEvent('refresh-notifications'));
        } catch (error) {
          console.error('Error creating nearby shipment notification:', error);
          console.error('Error details:', error.response?.data || error.message);
          // Don't show error to user, just log it
        }
      }
    } else {
      // Reset notification sent flag if no nearby shipments
      setNearbyNotificationSent(false);
    }
  };

  // Enriched shipments with distance and booking status
  const enrichedShipments = useMemo(() => {
    return shipments
      .filter((s) => !["Delivered", "Cancelled"].includes(s.status))
      .map((s) => {
        let distance = null;
        let isNearby = false;
        const shipmentId = s._id || s.id;

        if (userLocation) {
          const coords = getCityCoordinates(s.origin);
          if (coords) {
            distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              coords.latitude,
              coords.longitude
            );
            isNearby = distance <= prefs.threshold;
          }
        }

        // Check if shipment is booked by ANY user (from backend data)
        const isBookedByAnyone = s.isBooked === true || s.isBooked === false ? s.isBooked : false;
        const bookedBy = s.bookedBy || null;
        const globalBookingStatus = s.bookingStatus || null;

        // Check if ANY user has an active booking for this shipment
        const anyActiveBooking = bookings.find((b) => {
          const bookingShipmentId = b.shipmentId?._id || b.shipmentId?.id || b.shipmentId;
          return (
            (bookingShipmentId === shipmentId || bookingShipmentId?.toString() === shipmentId?.toString()) &&
            ["Pending", "Approved"].includes(b.status)
          );
        });

        // Check if current user has booked this shipment
        const userBooking = bookings.find((b) => {
          const bookingShipmentId = b.shipmentId?._id || b.shipmentId?.id || b.shipmentId;
          const bookingUserId = b.userId?._id || b.userId?.id || b.userId;
          return (
            (bookingShipmentId === shipmentId || bookingShipmentId?.toString() === shipmentId?.toString()) &&
            (bookingUserId === currentUserId || bookingUserId?.toString() === currentUserId?.toString()) &&
            ["Pending", "Approved"].includes(b.status)
          );
        });

        // Shipment is considered "booked" if ANY user has an active booking
        const isBooked = isBookedByAnyone || !!anyActiveBooking;
        const bookingStatus = userBooking?.status || (anyActiveBooking?.status) || globalBookingStatus;

        return { 
          ...s, 
          distance, 
          isNearby,
          isBooked, // True if ANY user has booked it
          isBookedByCurrentUser: !!userBooking, // True only if current user booked it
          bookedBy: bookedBy || (userBooking ? userBooking.userName : null),
          bookingStatus: bookingStatus || null
        };
      })
      .filter((s) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const id = s._id || s.id || "";
        return (
          id.toString().toLowerCase().includes(term) ||
          s.origin?.toLowerCase().includes(term) ||
          s.destination?.toLowerCase().includes(term) ||
          s.vehicleType?.toLowerCase().includes(term) ||
          s.load?.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => (b.isNearby ? 1 : 0) - (a.isNearby ? 1 : 0));
  }, [shipments, userLocation, searchTerm, bookings, currentUserId]);

  // Handle booking
  const handleBook = async (shipmentId) => {
    // Normalize shipmentId for comparison
    const shipmentIdStr = String(shipmentId).trim();
    const normalizedShipmentId = shipmentIdStr;
    
    // Prevent multiple simultaneous booking requests for the same shipment
    if (bookingInProgress.has(normalizedShipmentId)) {
      addNotification(
        t("availableShipments.bookingInProgress") || "Booking request is already in progress...",
        {},
        "info"
      );
      return;
    }

    // CRITICAL: Refresh bookings list FIRST to ensure we have the latest state from server
    // This must happen before any checks to prevent duplicate booking errors
    let latestBookings = bookings;
    try {
      const bookingsResponse = await bookingAPI.getAll();
      latestBookings = bookingsResponse.data || [];
      // Update state with latest bookings immediately
      setBookings(latestBookings);
    } catch (refreshError) {
      console.error('Failed to refresh bookings before booking check:', refreshError);
      addNotification(
        t("availableShipments.bookingFailed") || "Failed to check booking status. Please try again.",
        {},
        "error"
      );
      return; // Don't proceed if we can't refresh bookings
    }

    // Normalize shipmentId for comparison (handle both string and ObjectId)
    const normalizeId = (id) => {
      if (!id) return null;
      if (typeof id === 'object' && id.toString) return id.toString();
      return String(id).trim();
    };

    // Check if shipment is already booked by ANY user using FRESH bookings data
    const existingBooking = latestBookings.find((b) => {
      const bookingShipmentId = normalizeId(b.shipmentId?._id || b.shipmentId?.id || b.shipmentId);
      const status = b.status || '';
      return bookingShipmentId === normalizedShipmentId && 
             ["Pending", "Approved"].includes(status);
    });

    if (existingBooking) {
      // Check if it's booked by current user
      const bookingUserId = normalizeId(existingBooking.userId?._id || existingBooking.userId?.id || existingBooking.userId);
      const normalizedCurrentUserId = normalizeId(currentUserId);
      const isBookedByCurrentUser = bookingUserId === normalizedCurrentUserId;

      if (isBookedByCurrentUser) {
        addNotification(
          t("availableShipments.alreadyBooked") || "You already have a booking for this shipment",
          {},
          "info"
        );
      } else {
        addNotification(
          t("availableShipments.alreadyBookedByOther") || "This shipment is already booked by another user",
          {},
          "warning"
        );
      }
      
      // Refresh shipments to update UI
      try {
        const shipmentsRes = await shipmentAPI.getAvailable();
        setShipments(shipmentsRes.data || []);
      } catch (err) {
        console.error('Error refreshing shipments:', err);
      }
      
      return;
    }

    // Now check enriched shipment (this uses the updated bookings state)
    const enrichedShipment = enrichedShipments.find((s) => {
      const id = s._id || s.id;
      return id === shipmentId || id?.toString() === shipmentId?.toString();
    });

    // Double-check using enriched shipment data
    if (enrichedShipment?.isBooked) {
      if (enrichedShipment.isBookedByCurrentUser) {
        addNotification(
          t("availableShipments.alreadyBooked") || "You already have a booking for this shipment",
          {},
          "info"
        );
      } else {
        addNotification(
          t("availableShipments.alreadyBookedByOther") || "This shipment is already booked by another user",
          {},
          "warning"
        );
      }
      return;
    }

    const shipment = shipments.find((s) => s._id === shipmentId || s.id === shipmentId);

    if (!shipment) {
      addNotification(t("availableShipments.shipmentNotFound") || "Shipment not found", "warning");
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      addNotification(t("availableShipments.loginRequired") || "Please login to book shipments", "warning");
      setTimeout(() => {
        navigate('/user-login');
      }, 1500);
      return;
    }

    // FINAL CHECK: Refresh bookings one more time right before API call to prevent race conditions
    try {
      const finalBookingsResponse = await bookingAPI.getAll();
      const finalBookings = finalBookingsResponse.data || [];
      
      // Check one more time with the absolute latest data
      const normalizeId = (id) => {
        if (!id) return null;
        if (typeof id === 'object' && id.toString) return id.toString();
        return String(id).trim();
      };
      
      const finalCheck = finalBookings.find((b) => {
        const bookingShipmentId = normalizeId(b.shipmentId?._id || b.shipmentId?.id || b.shipmentId);
        const status = b.status || '';
        return bookingShipmentId === normalizedShipmentId && 
               ["Pending", "Approved"].includes(status);
      });
      
      if (finalCheck) {
        // Booking was created between our check and now - refresh UI and return
        setBookings(finalBookings);
        try {
          const shipmentsRes = await shipmentAPI.getAvailable();
          setShipments(shipmentsRes.data || []);
        } catch (err) {
          console.error('Error refreshing shipments:', err);
        }
        
        const bookingUserId = normalizeId(finalCheck.userId?._id || finalCheck.userId?.id || finalCheck.userId);
        const normalizedCurrentUserId = normalizeId(currentUserId);
        const isBookedByCurrentUser = bookingUserId === normalizedCurrentUserId;
        
        if (isBookedByCurrentUser) {
          addNotification(
            t("availableShipments.alreadyBooked") || "You already have a booking for this shipment",
            {},
            "info"
          );
        } else {
          addNotification(
            t("availableShipments.alreadyBookedByOther") || "This shipment is already booked by another user",
            {},
            "warning"
          );
        }
        return;
      }
      
      // Update bookings state with final check
      setBookings(finalBookings);
    } catch (finalCheckError) {
      console.warn('Final booking check failed, proceeding with caution:', finalCheckError);
      // Continue anyway - backend will catch duplicates
    }

    // Mark booking as in progress
    setBookingInProgress(prev => new Set(prev).add(normalizedShipmentId));

    try {
      const idToUse = shipment._id || shipment.id;
      
      // Validate ID format
      if (!idToUse) {
        addNotification("Invalid shipment ID", "error");
        setBookingInProgress(prev => {
          const newSet = new Set(prev);
          newSet.delete(normalizedShipmentId);
          return newSet;
        });
        return;
      }
      
      // Convert to string to ensure proper format
      const shipmentIdString = typeof idToUse === 'object' ? idToUse.toString() : String(idToUse);
      
      // Call API with shipmentId in request body
      const response = await bookingAPI.create(shipmentIdString);
      const newBooking = response.data;

      // Refresh bookings list to get the latest state from server
      try {
        const bookingsResponse = await bookingAPI.getAll();
        const allBookings = bookingsResponse.data || [];
        setBookings(allBookings);
      } catch (refreshError) {
        console.warn('Failed to refresh bookings, updating local state:', refreshError);
        // Fallback: Update bookings state locally - check for duplicates before adding
        setBookings((prev) => {
          const existingIndex = prev.findIndex(b => {
            const bookingId = b._id || b.id;
            const newBookingId = newBooking._id || newBooking.id;
            return bookingId?.toString() === newBookingId?.toString();
          });
          
          if (existingIndex >= 0) {
            // Update existing booking
            const updated = [...prev];
            updated[existingIndex] = newBooking;
            return updated;
          }
          
          // Add new booking
          return [...prev, newBooking];
        });
      }
      
      addNotification(
        t("availableShipments.bookingSent") || "Booking request sent successfully!",
        {},
        "success"
      );
    } catch (error) {
      console.error('Booking error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to create booking";
      const errorCode = error.response?.data?.code;
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        // Always refresh bookings list when we get a duplicate error to sync state
        let refreshedBookings = bookings;
        if (errorCode === 'DUPLICATE_BOOKING' || errorCode === 'DUPLICATE_USER_BOOKING' || 
            errorMessage.includes("already") || errorMessage.includes("exists")) {
          try {
            const bookingsResponse = await bookingAPI.getAll();
            refreshedBookings = bookingsResponse.data || [];
            setBookings(refreshedBookings);
          } catch (refreshError) {
            console.warn('Failed to refresh bookings after duplicate error:', refreshError);
          }
        }

        // Determine the exact error type and show appropriate message
        if (errorCode === 'DUPLICATE_USER_BOOKING' || errorMessage.includes("already have a booking")) {
          addNotification(
            t("availableShipments.alreadyBooked") || "You already have a booking for this shipment",
            {},
            "warning"
          );
        } else if (errorCode === 'DUPLICATE_BOOKING' || errorMessage.includes("already exists") || 
                   errorMessage.includes("already booked")) {
          // Check refreshed bookings to see who booked it
          const normalizeId = (id) => {
            if (!id) return null;
            if (typeof id === 'object' && id.toString) return id.toString();
            return String(id).trim();
          };
          
          const normalizedShipmentId = normalizeId(shipmentId);
          const normalizedCurrentUserId = normalizeId(currentUserId);
          
          const userBooking = refreshedBookings.find((b) => {
            const bookingShipmentId = normalizeId(b.shipmentId?._id || b.shipmentId?.id || b.shipmentId);
            const bookingUserId = normalizeId(b.userId?._id || b.userId?.id || b.userId);
            return (
              bookingShipmentId === normalizedShipmentId &&
              bookingUserId === normalizedCurrentUserId &&
              ["Pending", "Approved"].includes(b.status || '')
            );
          });
          
          // Also refresh shipments to update UI state
          try {
            const shipmentsRes = await shipmentAPI.getAvailable();
            setShipments(shipmentsRes.data || []);
          } catch (err) {
            console.error('Error refreshing shipments after duplicate error:', err);
          }
          
          if (userBooking) {
            addNotification(
              t("availableShipments.alreadyBooked") || "You already have a booking for this shipment",
              {},
              "info"
            );
          } else {
            addNotification(
              t("availableShipments.alreadyBookedByOther") || "This shipment is already booked by another user",
              {},
              "warning"
            );
          }
        } else {
          addNotification(errorMessage, {}, "error");
        }
      } else {
        addNotification(errorMessage, {}, "error");
      }
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        setTimeout(() => {
          navigate('/user-login');
        }, 2000);
      }
    } finally {
      // Remove from booking in progress set
      setBookingInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(normalizedShipmentId);
        return newSet;
      });
      
      // Always refresh shipments in finally to ensure UI is updated
      // This handles cases where booking state changed but UI wasn't updated
      try {
        const shipmentsRes = await shipmentAPI.getAvailable();
        setShipments(shipmentsRes.data || []);
      } catch (err) {
        // Silently fail - this is just a UI refresh
        console.warn('Failed to refresh shipments in finally block:', err);
      }
    }
  };

  return (
    <div className="user-available-shipments">
      {/* Header: Search + Location */}
      <div className="user-section-header">
        <div className="user-search-container">
          <i className="fas fa-search user-search-icon"></i>
          <input
            type="text"
            className="user-search-bar"
            placeholder={t("availableShipments.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="user-actions-right">
          {isGettingLocation ? (
            <span className="user-location-loading">
              <i className="fas fa-spinner fa-spin"></i> {t("availableShipments.gettingLocation")}
            </span>
          ) : !userLocation ? (
            <button className="user-location-btn" onClick={getLocation}>
              <i className="fas fa-location-crosshairs"></i> {t("availableShipments.enableLocation")}
            </button>
          ) : (
            <span className="user-location-active">
              <i className="fas fa-map-marker-alt"></i> {userLocationName}
              {nearbyCount > 0 && (
                <span className="user-nearby-badge">
                  {" "}{t("availableShipments.nearbyBadge", { count: nearbyCount })}
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h2 className="user-section-title">
        {t("availableShipments.title")} ({enrichedShipments.length})
      </h2>

      {/* Empty State */}
      {enrichedShipments.length === 0 ? (
        <div className="user-empty-state">
          <p>{t("availableShipments.noShipments")}</p>
          {!userLocation && <p>{t("availableShipments.enableLocationHint")}</p>}
        </div>
      ) : (
        <div className="user-shipments-grid">
          {enrichedShipments.map((shipment, index) => {
            const shipmentId = shipment._id || shipment.id;
            // Ensure unique key by combining ID with index
            const uniqueKey = `${shipmentId}-${index}`;
            return (
            <div
              key={uniqueKey}
              className={`user-shipment-card ${shipment.isNearby ? "user-nearby-card" : ""}`}
            >
              {/* Proximity Ribbon */}
              {shipment.isNearby && shipment.distance && (
                <div className="user-proximity-ribbon">
                  {t("availableShipments.kmAway", { distance: shipment.distance.toFixed(1) })}
                </div>
              )}

              {/* Image */}
              <div className="user-shipment-image-section">
                <img
                  src={getImageUrl(shipment.image, PLACEHOLDER_IMG)}
                  alt={t("availableShipments.shipmentImageAlt")}
                  className="user-shipment-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = PLACEHOLDER_IMG;
                  }}
                />
              </div>

              {/* Route */}
              <div className="user-route">
                <strong>{shipment.origin}</strong> → <strong>{shipment.destination}</strong>
              </div>

              {/* Booking Status Badge */}
              {shipment.isBooked && (
                <div className="user-booking-status-badge">
                  {shipment.isBookedByCurrentUser ? (
                    shipment.bookingStatus === "Approved" 
                      ? t("availableShipments.bookingApproved") || "✅ Booking Approved"
                      : t("availableShipments.bookingPending") || "⏳ Booking Pending"
                  ) : (
                    t("availableShipments.bookedByOther", { user: shipment.bookedBy || "Another User" }) || `🚫 Booked by ${shipment.bookedBy || "Another User"}`
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="user-shipment-actions">
                <button
                  className="user-btn-details"
                  onClick={() => navigate(`/shipment-details/${shipmentId}`)}
                >
                  {t("availableShipments.viewDetails")}
                </button>
                <button
                  className={`user-btn-book ${shipment.isBooked ? "user-btn-booked" : ""} ${bookingInProgress.has(String(shipmentId)) ? "user-btn-loading" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Prevent clicks if already booked or booking in progress
                    if (bookingInProgress.has(String(shipmentId)) || shipment.isBooked) {
                      if (shipment.isBooked && !shipment.isBookedByCurrentUser) {
                        addNotification(
                          t("availableShipments.alreadyBookedByOther") || "This shipment is already booked by another user",
                          {},
                          "warning"
                        );
                      } else if (shipment.isBookedByCurrentUser) {
                        addNotification(
                          t("availableShipments.alreadyBooked") || "You already have a booking for this shipment",
                          {},
                          "info"
                        );
                      }
                      return;
                    }
                    handleBook(shipmentId);
                  }}
                  disabled={shipment.isBooked || bookingInProgress.has(String(shipmentId))}
                  style={{ 
                    cursor: shipment.isBooked || bookingInProgress.has(String(shipmentId)) ? 'not-allowed' : 'pointer',
                    opacity: shipment.isBooked || bookingInProgress.has(String(shipmentId)) ? 0.6 : 1,
                    pointerEvents: shipment.isBooked || bookingInProgress.has(String(shipmentId)) ? 'none' : 'auto'
                  }}
                  title={shipment.isBooked && !shipment.isBookedByCurrentUser 
                    ? t("availableShipments.alreadyBookedByOther") || "This shipment is already booked by another user"
                    : shipment.isBookedByCurrentUser
                    ? t("availableShipments.youBookedThis") || "Booked"
                    : bookingInProgress.has(String(shipmentId))
                    ? t("availableShipments.bookingInProgress") || "Booking in progress..."
                    : ""}
                >
                  {bookingInProgress.has(String(shipmentId))
                    ? (t("availableShipments.bookingInProgress") || "Booking...")
                    : shipment.isBooked 
                    ? (shipment.isBookedByCurrentUser
                        ? (shipment.bookingStatus === "Approved" 
                            ? t("availableShipments.booked") || "✅ Booked"
                            : t("availableShipments.bookingPending") || "⏳ Pending")
                        : t("availableShipments.alreadyBooked") || "🚫 Booked")
                    : t("availableShipments.bookShipment")}
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}