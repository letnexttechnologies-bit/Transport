// src/component/TrackingPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { shipmentAPI } from "../utils/api";
import { calculateDistance, getCoordsFromCity } from "../utils/geolocation";
import "../styles/trackingpage.css";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8';

// Indian cities database for fallback calculation
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
  Gopi: { latitude: 13.0827, longitude: 80.2707, state: 'Tamil Nadu' }, // Approximate for Gopi
};

// Get city coordinates (fuzzy match)
const getCityCoordinates = (cityName) => {
  if (!cityName) return null;
  const name = cityName.trim();
  
  // Direct match
  if (indianCities[name]) return indianCities[name];
  
  // Case-insensitive match
  const lower = name.toLowerCase();
  for (const [city, coords] of Object.entries(indianCities)) {
    if (city.toLowerCase() === lower || 
        city.toLowerCase().includes(lower) || 
        lower.includes(city.toLowerCase())) {
      return coords;
    }
  }
  
  // Try using geolocation utility
  return getCoordsFromCity(name);
};

// Format distance
const formatDistance = (km) => {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  } else if (km < 10) {
    return `${km.toFixed(1)} km`;
  } else {
    return `${Math.round(km)} km`;
  }
};

// Estimate duration based on distance (assuming average truck speed of 50 km/h)
const estimateDuration = (distanceKm) => {
  const avgSpeedKmh = 50; // Average truck speed
  const hours = distanceKm / avgSpeedKmh;
  
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} min`;
  } else {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) {
      return `${h} hr`;
    }
    return `${h} hr ${m} min`;
  }
};

export default function TrackingPage() {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const [shipmentData, setShipmentData] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);

  // Load shipment data and calculate route
  useEffect(() => {
    const loadShipment = async () => {
      try {
        setLoading(true);
        const response = await shipmentAPI.getTracking(shipmentId);
        const shipment = response.data.shipment;
        setShipmentData(shipment);
        
        // Calculate route using Google Directions API
        if (shipment.origin && shipment.destination) {
          await calculateRoute(shipment.origin, shipment.destination);
        }
      } catch (error) {
        console.error("Error loading tracking data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadShipment();
  }, [shipmentId]);

  // Fallback: Calculate distance and duration using city coordinates
  const calculateRouteFallback = (origin, destination) => {
    try {
      const originCoords = getCityCoordinates(origin);
      const destCoords = getCityCoordinates(destination);
      
      if (originCoords && destCoords) {
        const distanceKm = calculateDistance(
          originCoords.latitude,
          originCoords.longitude,
          destCoords.latitude,
          destCoords.longitude
        );
        
        if (distanceKm > 0) {
          const distanceText = formatDistance(distanceKm);
          const durationText = estimateDuration(distanceKm);
          
          setRouteInfo({
            distance: distanceText,
            duration: durationText,
            distanceValue: distanceKm * 1000, // Convert to meters
            isFallback: true
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error in fallback calculation:', error);
      return false;
    }
  };

  // Calculate route using Google Directions API with fallback
  const calculateRoute = async (origin, destination) => {
    try {
      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}&mode=driving`;
      
      const response = await fetch(directionsUrl);
      const data = await response.json();
      
      if (data.status === 'OK' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        // Extract distance and duration
        const distance = leg.distance.text;
        const duration = leg.duration.text;
        const distanceValue = leg.distance.value; // in meters
        
        setRouteInfo({
          distance,
          duration,
          distanceValue,
          steps: leg.steps,
          overviewPolyline: route.overview_polyline.points,
          isFallback: false
        });
      } else {
        console.warn('Google Directions API error:', data.status, '- Using fallback calculation');
        // Fallback: calculate using city coordinates
        const fallbackSuccess = calculateRouteFallback(origin, destination);
        if (!fallbackSuccess) {
          setRouteInfo({
            distance: 'Unable to calculate',
            duration: 'Unable to calculate',
            distanceValue: 0,
            isFallback: false
          });
        }
      }
    } catch (error) {
      console.warn('Error calling Google Directions API:', error, '- Using fallback calculation');
      // Fallback: calculate using city coordinates
      const fallbackSuccess = calculateRouteFallback(origin, destination);
      if (!fallbackSuccess) {
        setRouteInfo({
          distance: 'Unable to calculate',
          duration: 'Unable to calculate',
          distanceValue: 0,
          isFallback: false
        });
      }
    }
  };

  // Mock route steps based on origin and destination
  const getRouteSteps = () => {
    if (!shipmentData) return [];
    
    const baseSteps = [
      { location: `${shipmentData.origin}`, status: "completed", time: "Departure" },
      { location: "In Transit", status: "current", time: "Current Location" },
      { location: `${shipmentData.destination}`, status: "upcoming", time: "Estimated Arrival" }
    ];
    
    return baseSteps;
  };

  const liveUpdates = [
    { time: "2 mins ago", message: "Vehicle is moving on highway" },
    { time: "45 mins ago", message: "Break stop completed" },
    { time: "2 hours ago", message: "Departed from origin" },
    { time: "5 hours ago", message: "Document verification completed" }
  ];

  const handleContactDriver = () => {
    if (shipmentData?.driver?.phone) {
      alert(`Calling driver: ${shipmentData.driver.phone}`);
    } else {
      alert("Driver phone number not available");
    }
  };

  const handleViewDetails = () => {
    navigate(`/shipment-details/${shipmentId}`);
  };

  const getStepStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✓';
      case 'current': return '➤';
      case 'upcoming': return '○';
      default: return '○';
    }
  };

  const getStepStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'step-completed';
      case 'current': return 'step-current';
      case 'upcoming': return 'step-upcoming';
      default: return 'step-upcoming';
    }
  };

  // Get Google Maps URL with route overlay (with error handling)
  const getGoogleMapsUrl = () => {
    if (!shipmentData) return '';
    
    const origin = encodeURIComponent(shipmentData.origin);
    const destination = encodeURIComponent(shipmentData.destination);
    
    // Try to use Google Maps embed, but if API key fails, use static map or fallback
    try {
      // Use directions mode to show route
      return `https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_MAPS_API_KEY}&origin=${origin}&destination=${destination}&mode=driving&zoom=10`;
    } catch (error) {
      // Fallback: Use static map URL
      return `https://www.google.com/maps?q=${origin}+to+${destination}&output=embed`;
    }
  };

  if (!shipmentData) {
    return (
      <div className="tracking-container">
        <div className="tracking-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1>Track Shipment</h1>
          <div className="shipment-id">ID: #{shipmentId}</div>
        </div>
        <div className="loading-state">
          <p>Loading shipment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tracking-container">
      <div className="tracking-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Track Shipment</h1>
        <div className="shipment-id">ID: #{shipmentId}</div>
      </div>

      <div className="tracking-content">
        <div className="map-section">
          <div className="map-container">
            {/* Route Information Overlay */}
            {shipmentData && (
              <div className="route-info-overlay">
                <div className="route-info-header">
                  <div className="route-origin-destination">
                    {shipmentData.origin?.toUpperCase()} → {shipmentData.destination?.toUpperCase()}
                  </div>
                </div>
                {routeInfo && (
                  <>
                    <div className="route-info-item distance">
                      <span className="route-label">Distance:</span>
                      <span className="route-value">{routeInfo.distance}</span>
                    </div>
                    <div className="route-info-item duration">
                      <span className="route-label">Duration:</span>
                      <span className="route-value">{routeInfo.duration}</span>
                    </div>
                    {routeInfo.isFallback && (
                      <div className="route-info-note">
                        <small>Estimated (using city coordinates)</small>
                      </div>
                    )}
                  </>
                )}
                {!routeInfo && loading && (
                  <div className="route-info-loading">Calculating route...</div>
                )}
              </div>
            )}
            
            {/* Google Maps Iframe */}
            <iframe
              className="google-map"
              src={getGoogleMapsUrl()}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Shipment Route Map"
            >
            </iframe>
          </div>

          <div className="progress-section">
            <div className="progress-header">
              <h3>Delivery Progress</h3>
              <span className="progress-percent">{shipmentData.progress || 30}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${shipmentData.progress || 30}%` }}
              ></div>
            </div>
            <div className="progress-stats">
              <div className="stat">
                <span className="stat-label">Vehicle Type</span>
                <span className="stat-value">{shipmentData.vehicleType}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Status</span>
                <span className="stat-value">{shipmentData.status}</span>
              </div>
              <div className="stat">
                <span className="stat-label">ETA</span>
                <span className="stat-value">{routeInfo?.duration || shipmentData.eta || 'Calculating...'}</span>
              </div>
              {routeInfo && (
                <div className="stat">
                  <span className="stat-label">Distance</span>
                  <span className="stat-value">{routeInfo.distance}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="details-section">
          {/* Shipment Details */}
          <div className="info-card shipment-card">
            <h3>Shipment Details</h3>
            <div className="shipment-details-grid">
              <div className="detail-item">
                <strong>Load Type:</strong>
                <span>{shipmentData.load || "Not specified"}</span>
              </div>
              <div className="detail-item">
                <strong>Truck Type:</strong>
                <span>{shipmentData.truck || "Not specified"}</span>
              </div>
              <div className="detail-item">
                <strong>Container:</strong>
                <span>{shipmentData.container || "Not specified"}</span>
              </div>
              <div className="detail-item">
                <strong>Weight:</strong>
                <span>{shipmentData.weight || "Not specified"}</span>
              </div>
              {shipmentData.priority && (
                <div className="detail-item priority">
                  <strong>Priority:</strong>
                  <span className="priority-badge">High Priority</span>
                </div>
              )}
            </div>
          </div>

          {/* Route Timeline */}
          <div className="info-card route-card">
            <h3>Route Timeline</h3>
            <div className="timeline">
              {getRouteSteps().map((step, index) => (
                <div key={index} className={`timeline-step ${getStepStatusClass(step.status)}`}>
                  <div className="step-icon">{getStepStatusIcon(step.status)}</div>
                  <div className="step-content">
                    <div className="step-location">{step.location}</div>
                    <div className="step-time">{step.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Updates */}
          <div className="info-card updates-card">
            <h3>Live Updates</h3>
            <div className="updates-list">
              {liveUpdates.map((update, index) => (
                <div key={index} className="update-item">
                  <div className="update-time">{update.time}</div>
                  <div className="update-message">{update.message}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button className="action-btn primary" onClick={handleViewDetails}>
              📋 View Full Details
            </button>
            <button className="action-btn secondary">
              📄 Get E-Way Bill
            </button>
            <button className="action-btn secondary">
              🚨 Report Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}