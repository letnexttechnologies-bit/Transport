import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ShipmentDetails.css";

export default function ShipmentDetails() {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editedShipment, setEditedShipment] = useState(null);

  // Load shipment data
  useEffect(() => {
    const savedShipments = localStorage.getItem('shipments');
    if (savedShipments) {
      const shipments = JSON.parse(savedShipments);
      const currentShipment = shipments.find(s => s.id === shipmentId);
      setShipment(currentShipment);
      setEditedShipment(currentShipment);
    }
  }, [shipmentId]);

  const handleSave = () => {
    const savedShipments = localStorage.getItem('shipments');
    if (savedShipments) {
      const shipments = JSON.parse(savedShipments);
      const updatedShipments = shipments.map(s => 
        s.id === shipmentId ? editedShipment : s
      );
      localStorage.setItem('shipments', JSON.stringify(updatedShipments));
      setShipment(editedShipment);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedShipment(shipment);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedShipment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDriverInputChange = (field, value) => {
    setEditedShipment(prev => ({
      ...prev,
      driver: {
        ...prev.driver,
        [field]: value
      }
    }));
  };

  // Quick Actions Navigation Handlers
  const handleContactSupport = () => {
    navigate('/contact-support', { 
      state: { 
        shipmentId: shipmentId,
        shipmentData: shipment 
      } 
    });
  };

  const handleEmailReport = () => {
    navigate('/email-report', { 
      state: { 
        shipmentId: shipmentId,
        shipmentData: shipment 
      } 
    });
  };

  const handlePrintDetails = () => {
    navigate('/print-details', { 
      state: { 
        shipmentId: shipmentId,
        shipmentData: shipment 
      } 
    });
  };

  const handleReportIssue = () => {
    navigate('/report-issue', { 
      state: { 
        shipmentId: shipmentId,
        shipmentData: shipment 
      } 
    });
  };

  // Fix for track shipment navigation
  const handleTrackShipment = () => {
    navigate(`/track-shipment/${shipmentId}`);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "In Transit": return "status-transit";
      case "Delivered": return "status-delivered";
      case "At Warehouse": return "status-warehouse";
      case "Scheduled": return "status-scheduled";
      default: return "status-scheduled";
    }
  };

  const getPriorityClass = (priority) => {
    return priority ? "priority-high" : "priority-normal";
  };

  if (!shipment) {
    return (
      <div className="shipment-details-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading shipment details...</p>
        </div>
      </div>
    );
  }

  const currentData = isEditing ? editedShipment : shipment;

  return (
    <div className="shipment-details-container">
      {/* Header */}
      <div className="details-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span className="back-arrow">←</span>
          Back to Dashboard
        </button>
        <div className="header-actions">
          <button 
            className="track-btn"
            onClick={handleTrackShipment}
          >
            🗺️ Track Shipment
          </button>
          {/* {!isEditing ? (
            <button 
              className="edit-btn"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Edit Details
            </button>
          ) : (
            <div className="edit-actions">
              <button className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          )} */}
        </div>
      </div>

      {/* Main Content */}
      <div className="details-content">
        {/* Left Column - Overview */}
        <div className="left-column">
          {/* Shipment Card */}
          <div className="shipment-hero-card">
            <div className="hero-image">
              <img 
                src={currentData.shipmentImage || "/api/placeholder/400/200"} 
                alt={currentData.vehicleType} 
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='18' fill='%23666'%3E🚚 Shipment Image%3C/text%3E%3C/svg%3E";
                }}
              />
              <div className="image-overlay">
                <span className={`status-badge ${getStatusClass(currentData.status)}`}>
                  {currentData.status}
                </span>
                {currentData.priority && (
                  <span className="priority-tag">🔥 Priority</span>
                )}
              </div>
            </div>
            
            <div className="hero-content">
              <h1>{currentData.vehicleType}</h1>
              <div className="route-display">
                <div className="origin">
                  <span className="city">{currentData.origin}</span>
                  <span className="label">Origin</span>
                </div>
                <div className="route-line">
                  <div className="line"></div>
                  <div className="arrow">→</div>
                </div>
                <div className="destination">
                  <span className="city">{currentData.destination}</span>
                  <span className="label">Destination</span>
                </div>
              </div>
              
              <div className="eta-section">
                <div className="eta-badge">
                  <span className="eta-label">Estimated Arrival</span>
                  <span className="eta-time">{currentData.eta}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="tabs-navigation">
            <button 
              className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              📋 Overview
            </button>
            {/* <button 
              className={`tab-btn ${activeTab === "driver" ? "active" : ""}`}
              onClick={() => setActiveTab("driver")}
            >
              👤 Driver Info
            </button> */}
            <button 
              className={`tab-btn ${activeTab === "documents" ? "active" : ""}`}
              onClick={() => setActiveTab("documents")}
            >
              📄 Documents
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "overview" && (
              <div className="overview-tab">
                <div className="info-grid">
                  <div className="info-card">
                    <h3>🚚 Vehicle Information</h3>
                    <div className="info-list">
                      <div className="info-item">
                        <span className="label">Vehicle Type</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentData.vehicleType}
                            onChange={(e) => handleInputChange("vehicleType", e.target.value)}
                            className="edit-input"
                          />
                        ) : (
                          <span className="value">{currentData.vehicleType}</span>
                        )}
                      </div>
                      <div className="info-item">
                        <span className="label">Truck Model</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentData.truckType || currentData.truck}
                            onChange={(e) => handleInputChange("truckType", e.target.value)}
                            className="edit-input"
                          />
                        ) : (
                          <span className="value">{currentData.truckType || currentData.truck}</span>
                        )}
                      </div>
                      <div className="info-item">
                        <span className="label">Container Type</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentData.container}
                            onChange={(e) => handleInputChange("container", e.target.value)}
                            className="edit-input"
                          />
                        ) : (
                          <span className="value">{currentData.container}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="info-card">
                    <h3>📦 Load Details</h3>
                    <div className="info-list">
                      <div className="info-item">
                        <span className="label">Load Description</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentData.loadDescription || currentData.load}
                            onChange={(e) => handleInputChange("loadDescription", e.target.value)}
                            className="edit-input"
                          />
                        ) : (
                          <span className="value">{currentData.loadDescription || currentData.load}</span>
                        )}
                      </div>
                      <div className="info-item">
                        <span className="label">Total Weight</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentData.weight}
                            onChange={(e) => handleInputChange("weight", e.target.value)}
                            className="edit-input"
                          />
                        ) : (
                          <span className="value">{currentData.weight}</span>
                        )}
                      </div>
                      <div className="info-item">
                        <span className="label">Priority</span>
                        {isEditing ? (
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={currentData.priority}
                              onChange={(e) => handleInputChange("priority", e.target.checked)}
                            />
                            High Priority Shipment
                          </label>
                        ) : (
                          <span className={`value ${getPriorityClass(currentData.priority)}`}>
                            {currentData.priority ? "High Priority" : "Standard"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="info-card">
                    <h3>📍 Route Information</h3>
                    <div className="info-list">
                      <div className="info-item">
                        <span className="label">Origin</span>
                        {isEditing ? (
                          <select
                            value={currentData.origin}
                            onChange={(e) => handleInputChange("origin", e.target.value)}
                            className="edit-select"
                          >
                            <option value="New York">New York</option>
                            <option value="Shanghai">Shanghai</option>
                            <option value="Detroit">Detroit</option>
                            <option value="Chicago">Chicago</option>
                            <option value="Miami">Miami</option>
                          </select>
                        ) : (
                          <span className="value">{currentData.origin}</span>
                        )}
                      </div>
                      <div className="info-item">
                        <span className="label">Destination</span>
                        {isEditing ? (
                          <select
                            value={currentData.destination}
                            onChange={(e) => handleInputChange("destination", e.target.value)}
                            className="edit-select"
                          >
                            <option value="Los Angeles">Los Angeles</option>
                            <option value="Rotterdam">Rotterdam</option>
                            <option value="Miami">Miami</option>
                            <option value="Chicago">Chicago</option>
                            <option value="Seattle">Seattle</option>
                          </select>
                        ) : (
                          <span className="value">{currentData.destination}</span>
                        )}
                      </div>
                      <div className="info-item">
                        <span className="label">Status</span>
                        {isEditing ? (
                          <select
                            value={currentData.status}
                            onChange={(e) => handleInputChange("status", e.target.value)}
                            className="edit-select"
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="In Transit">In Transit</option>
                            <option value="At Warehouse">At Warehouse</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        ) : (
                          <span className={`value ${getStatusClass(currentData.status)}`}>
                            {currentData.status}
                          </span>
                        )}
                      </div>
                      <div className="info-item">
                        <span className="label">ETA</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentData.eta}
                            onChange={(e) => handleInputChange("eta", e.target.value)}
                            className="edit-input"
                            placeholder="2 days"
                          />
                        ) : (
                          <span className="value">{currentData.eta}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "driver" && (
              <div className="driver-tab">
                <div className="driver-card">
                  <h3>Driver Information</h3>
                  {currentData.driver ? (
                    <div className="driver-details">
                      <div className="driver-avatar-large">
                        {currentData.driver.name ? 
                          currentData.driver.name.split(' ').map(n => n[0]).join('') : 'DR'
                        }
                      </div>
                      <div className="driver-info-grid">
                        <div className="info-item">
                          <span className="label">Full Name</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={currentData.driver.name}
                              onChange={(e) => handleDriverInputChange("name", e.target.value)}
                              className="edit-input"
                            />
                          ) : (
                            <span className="value">{currentData.driver.name}</span>
                          )}
                        </div>
                        <div className="info-item">
                          <span className="label">Phone Number</span>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={currentData.driver.phone}
                              onChange={(e) => handleDriverInputChange("phone", e.target.value)}
                              className="edit-input"
                            />
                          ) : (
                            <span className="value">{currentData.driver.phone}</span>
                          )}
                        </div>
                        <div className="info-item">
                          <span className="label">License Number</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={currentData.driver.license}
                              onChange={(e) => handleDriverInputChange("license", e.target.value)}
                              className="edit-input"
                            />
                          ) : (
                            <span className="value">{currentData.driver.license}</span>
                          )}
                        </div>
                        <div className="info-item">
                          <span className="label">Assigned Vehicle</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={currentData.driver.vehicle}
                              onChange={(e) => handleDriverInputChange("vehicle", e.target.value)}
                              className="edit-input"
                            />
                          ) : (
                            <span className="value">{currentData.driver.vehicle}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="no-driver">
                      <p>No driver information available.</p>
                      {isEditing && (
                        <button 
                          className="add-driver-btn"
                          onClick={() => handleInputChange("driver", {
                            name: "John Driver",
                            phone: "+1-555-0123",
                            license: "DL123456789",
                            vehicle: currentData.truckType || currentData.truck
                          })}
                        >
                          + Add Driver Information
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="documents-tab">
                <div className="documents-card">
                  <h3>Shipment Documents</h3>
                  <div className="documents-list">
                    <div className="document-item">
                      <div className="doc-icon">📄</div>
                      <div className="doc-info">
                        <span className="doc-name">Bill of Lading</span>
                        <span className="doc-status verified">Verified</span>
                      </div>
                      <button className="doc-download" onClick={() => alert("Downloading Bill of Lading...")}>
                        Download
                      </button>
                    </div>
                    <div className="document-item">
                      <div className="doc-icon">📋</div>
                      <div className="doc-info">
                        <span className="doc-name">Commercial Invoice</span>
                        <span className="doc-status pending">Pending</span>
                      </div>
                      <button className="doc-download" onClick={() => alert("Please upload Commercial Invoice document")}>
                        Upload
                      </button>
                    </div>
                    <div className="document-item">
                      <div className="doc-icon">🛃</div>
                      <div className="doc-info">
                        <span className="doc-name">Customs Declaration</span>
                        <span className="doc-status review">In Review</span>
                      </div>
                      <button className="doc-download" onClick={() => alert("Opening Customs Declaration...")}>
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Quick Actions & Map */}
        <div className="right-column">
          <div className="quick-actions-panel">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-btn primary" onClick={handleContactSupport}>
                📞 Contact Support
              </button>
              <button className="action-btn secondary" onClick={handleEmailReport}>
                📧 Email Report
              </button>
              <button className="action-btn secondary" onClick={handlePrintDetails}>
                🖨️ Print Details
              </button>
              <button className="action-btn warning" onClick={handleReportIssue}>
                🚨 Report Issue
              </button>
            </div>
          </div>

          <div className="map-preview">
            <h3>Route Preview</h3>
            <div className="mini-map">
              <div className="map-placeholder">
                <div className="route-overview">
                  <div className="route-point">
                    <div className="point-marker start">🟢</div>
                    <div className="point-marker start">START</div>

                    <span>{currentData.origin}</span>
                  </div>
                  <div className="route-line-mini">
                    <div className="dotted-line"></div>
                  </div>
                  <div className="route-point">
                    <div className="point-marker end">STOP</div>
                    <div className="point-marker end">🔴</div>
                    <span>{currentData.destination}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="shipment-meta">
            <h3>Shipment Metadata</h3>
            <div className="meta-list">
              <div className="meta-item">
                <span className="meta-label">Shipment ID</span>
                <span className="meta-value">#{shipmentId}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Created</span>
                <span className="meta-value">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Last Updated</span>
                <span className="meta-value">Just now</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Total Distance</span>
                <span className="meta-value">~2,800 miles</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}