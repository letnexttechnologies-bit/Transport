import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { shipmentAPI, getImageUrl } from "../utils/api";
import "../styles/shipmentdetails.css";

export default function ShipmentDetails() {
  const { t } = useTranslation();
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editedShipment, setEditedShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load shipment data
  useEffect(() => {
    const loadShipment = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await shipmentAPI.getById(shipmentId);
        if (response.data) {
          setShipment(response.data);
          setEditedShipment(response.data);
        } else {
          setError("Shipment not found");
        }
      } catch (error) {
        console.error("Error loading shipment:", error);
        setError(error.response?.data?.message || "Failed to load shipment details");
      } finally {
        setLoading(false);
      }
    };
    
    if (shipmentId) {
      loadShipment();
    }
  }, [shipmentId]);

  const handleSave = async () => {
    try {
      await shipmentAPI.update(shipmentId, editedShipment);
      setShipment(editedShipment);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving shipment:", error);
      alert(error.response?.data?.message || "Failed to save shipment");
    }
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

  // Convert status to translation key format (camelCase)
  const getStatusTranslationKey = (status) => {
    if (!status) return 'pending';
    // Convert "In Transit" to "inTransit", "At Warehouse" to "atWarehouse", etc.
    return status
      .split(' ')
      .map((word, index) => 
        index === 0 
          ? word.toLowerCase() 
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('');
  };

  const getPriorityClass = (priority) => {
    return priority ? "priority-high" : "priority-normal";
  };

  if (loading) {
    return (
      <div className="shipment-details-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>{t("shipmentDetails.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="shipment-details-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>{error || "Shipment not found"}</h2>
          <button className="back-button" onClick={() => navigate(-1)}>
            <span className="back-arrow">←</span>
            {t("shipmentDetails.backToDashboard")}
          </button>
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
          {t("shipmentDetails.backToDashboard")}
        </button>
        <div className="header-actions">
          <button 
            className="track-btn"
            onClick={handleTrackShipment}
          >
            🗺️ {t("shipmentDetails.trackShipment")}
          </button>
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
                src={getImageUrl(currentData.image || currentData.shipmentImage, "/Truck Images.jpeg")} 
                alt={currentData.vehicleType} 
                onError={(e) => {
                  e.target.src = "/Truck Images.jpeg";
                }}
              />
              <div className="image-overlay">
                <span className={`status-badge ${getStatusClass(currentData.status)}`}>
                  {t(`status.${getStatusTranslationKey(currentData.status)}`) || currentData.status || 'Pending'}
                </span>
                {currentData.priority && (
                  <span className="priority-tag">🔥 {t("shipmentDetails.priority")}</span>
                )}
              </div>
            </div>
            
            <div className="hero-content">
              <h1>{currentData.vehicleType}</h1>
              <div className="route-display">
                <div className="origin">
                  <span className="city">{currentData.origin}</span>
                  <span className="label">{t("shipmentDetails.origin")}</span>
                </div>
                <div className="route-line">
                  <div className="line"></div>
                  <div className="arrow">→</div>
                </div>
                <div className="destination">
                  <span className="city">{currentData.destination}</span>
                  <span className="label">{t("shipmentDetails.destination")}</span>
                </div>
              </div>
              
              <div className="eta-section">
                <div className="eta-badge">
                  <span className="eta-label">{t("shipmentDetails.estimatedArrival")}</span>
                  <span className="eta-time">
                    {currentData.eta || currentData.date 
                      ? (currentData.eta || new Date(currentData.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }))
                      : t("shipmentDetails.eta") || "N/A"}
                  </span>
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
              📋 {t("shipmentDetails.tabOverview")}
            </button>
            <button 
              className={`tab-btn ${activeTab === "documents" ? "active" : ""}`}
              onClick={() => setActiveTab("documents")}
            >
              📄 {t("shipmentDetails.tabDocuments")}
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "overview" && (
              <div className="overview-tab">
                <div className="info-grid">
                  <div className="info-card">
                    <h3>🚚 {t("shipmentDetails.vehicleInfo")}</h3>
                    <div className="info-list">
                      <div className="info-item">
                        <span className="label">{t("shipmentDetails.vehicleType")}</span>
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
                        <span className="label">{t("shipmentDetails.truckModel")}</span>
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
                        <span className="label">{t("shipmentDetails.containerType")}</span>
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
                    <h3>📦 {t("shipmentDetails.loadDetails")}</h3>
                    <div className="info-list">
                      <div className="info-item">
                        <span className="label">{t("shipmentDetails.loadDescription")}</span>
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
                        <span className="label">{t("shipmentDetails.totalWeight")}</span>
                        {isEditing ? (
                          <input
                            type="number"
                            value={currentData.weight || 0}
                            onChange={(e) => handleInputChange("weight", parseFloat(e.target.value) || 0)}
                            className="edit-input"
                            min="0"
                            step="0.1"
                          />
                        ) : (
                          <span className="value">{currentData.weight} kg</span>
                        )}
                      </div>
                      <div className="info-item">
                        <span className="label">{t("shipmentDetails.priority")}</span>
                        {isEditing ? (
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={currentData.priority}
                              onChange={(e) => handleInputChange("priority", e.target.checked)}
                            />
                            {t("shipmentDetails.highPriority")}
                          </label>
                        ) : (
                          <span className={`value ${getPriorityClass(currentData.priority)}`}>
                            {currentData.priority ? t("shipmentDetails.high") : t("shipmentDetails.standard")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="info-card">
                    <h3>📍 {t("shipmentDetails.routeInfo")}</h3>
                    <div className="info-list">
                      <div className="info-item">
                        <span className="label">{t("shipmentDetails.origin")}</span>
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
                        <span className="label">{t("shipmentDetails.destination")}</span>
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
                        <span className="label">{t("shipmentDetails.status")}</span>
                        {isEditing ? (
                          <select
                            value={currentData.status}
                            onChange={(e) => handleInputChange("status", e.target.value)}
                            className="edit-select"
                          >
                            <option value="Scheduled">{t("status.scheduled")}</option>
                            <option value="Pending">{t("status.pending")}</option>
                            <option value="In Transit">{t("status.inTransit")}</option>
                            <option value="At Warehouse">{t("status.atWarehouse")}</option>
                            <option value="Delivered">{t("status.delivered")}</option>
                            <option value="Cancelled">{t("status.cancelled")}</option>
                          </select>
                        ) : (
                          <span className={`value ${getStatusClass(currentData.status)}`}>
                            {t(`status.${getStatusTranslationKey(currentData.status)}`) || currentData.status || 'Pending'}
                          </span>
                        )}
                      </div>
                      <div className="info-item">
                        <span className="label">{t("shipmentDetails.eta")}</span>
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

            {activeTab === "documents" && (
              <div className="documents-tab">
                <div className="documents-card">
                  <h3>{t("shipmentDetails.documentsTitle")}</h3>
                  <div className="documents-list">
                    <div className="document-item">
                      <div className="doc-icon">📄</div>
                      <div className="doc-info">
                        <span className="doc-name">{t("shipmentDetails.billOfLading")}</span>
                        <span className="doc-status verified">{t("shipmentDetails.verified")}</span>
                      </div>
                      <button className="doc-download" onClick={() => alert(t("shipmentDetails.downloading") + " " + t("shipmentDetails.billOfLading"))}>
                        {t("buttons.download")}
                      </button>
                    </div>
                    <div className="document-item">
                      <div className="doc-icon">📋</div>
                      <div className="doc-info">
                        <span className="doc-name">{t("shipmentDetails.commercialInvoice")}</span>
                        <span className="doc-status pending">{t("shipmentDetails.pending")}</span>
                      </div>
                      <button className="doc-download" onClick={() => alert(t("shipmentDetails.uploadPrompt") + " " + t("shipmentDetails.commercialInvoice"))}>
                        {t("buttons.upload")}
                      </button>
                    </div>
                    <div className="document-item">
                      <div className="doc-icon">🛃</div>
                      <div className="doc-info">
                        <span className="doc-name">{t("shipmentDetails.customsDeclaration")}</span>
                        <span className="doc-status review">{t("shipmentDetails.inReview")}</span>
                      </div>
                      <button className="doc-download" onClick={() => alert(t("shipmentDetails.viewing") + " " + t("shipmentDetails.customsDeclaration"))}>
                        {t("buttons.view")}
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
            <h3>{t("shipmentDetails.quickActions")}</h3>
            <div className="action-buttons">
              <button className="action-btn primary" onClick={handleContactSupport}>
                📞 {t("shipmentDetails.contactSupport")}
              </button>
              <button className="action-btn secondary" onClick={handleEmailReport}>
                📧 {t("shipmentDetails.emailReport")}
              </button>
              <button className="action-btn secondary" onClick={handlePrintDetails}>
                🖨️ {t("shipmentDetails.printDetails")}
              </button>
              <button className="action-btn warning" onClick={handleReportIssue}>
                🚨 {t("shipmentDetails.reportIssue")}
              </button>
            </div>
          </div>

          <div className="map-preview">
            <h3>{t("shipmentDetails.routePreview")}</h3>
            <div className="mini-map">
              <div className="map-placeholder">
                <div className="route-overview">
                  {/* START Point */}
                  <div className="route-point start-point">
                    <div className="marker-ball start-ball"></div>
                    <div className="point-label start-label">{t("shipmentDetails.start")}</div>
                    <span className="point-city">{currentData.origin}</span>
                  </div>
                  
                  {/* Route Line */}
                  
                  
                  {/* STOP Point */}
                  <div className="route-point end-point">
                    <div className="marker-ball end-ball"></div>
                    <div className="point-label end-label">{t("shipmentDetails.stop")}</div>
                    <span className="point-city">{currentData.destination}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="shipment-meta">
            <h3>{t("shipmentDetails.metadata")}</h3>
            <div className="meta-list">
              <div className="meta-item">
                <span className="meta-label">{t("shipmentDetails.shipmentId")}</span>
                <span className="meta-value">#{currentData.shipmentId || shipmentId}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">{t("shipmentDetails.created")}</span>
                <span className="meta-value">
                  {currentData.createdAt 
                    ? new Date(currentData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">{t("shipmentDetails.lastUpdated")}</span>
                <span className="meta-value">
                  {currentData.updatedAt 
                    ? new Date(currentData.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : t("shipmentDetails.justNow")}
                </span>
              </div>
              {currentData.weight && (
                <div className="meta-item">
                  <span className="meta-label">{t("shipmentDetails.totalWeight")}</span>
                  <span className="meta-value">{currentData.weight} kg</span>
                </div>
              )}
              {currentData.price && (
                <div className="meta-item">
                  <span className="meta-label">{t("form.price") || "Price"}</span>
                  <span className="meta-value">₹{currentData.price}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}