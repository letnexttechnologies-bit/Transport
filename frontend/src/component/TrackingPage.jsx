// src/component/TrackingPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./trackingpage.css";

export default function TrackingPage() {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const [shipmentData, setShipmentData] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState("2 hours 15 mins");

  // Load shipment data from localStorage
  useEffect(() => {
    const savedShipments = localStorage.getItem('shipments');
    if (savedShipments) {
      const shipments = JSON.parse(savedShipments);
      const currentShipment = shipments.find(shipment => shipment.id === shipmentId);
      setShipmentData(currentShipment);
    }
  }, [shipmentId]);

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

  // Get Google Maps URL based on origin and destination
  const getGoogleMapsUrl = () => {
    if (!shipmentData) return '';
    
    const origin = encodeURIComponent(shipmentData.origin);
    const destination = encodeURIComponent(shipmentData.destination);
    
    return `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${origin}&destination=${destination}&mode=driving`;
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
                <span className="stat-value">{shipmentData.eta}</span>
              </div>
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