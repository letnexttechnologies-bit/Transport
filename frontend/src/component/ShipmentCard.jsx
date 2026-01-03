import React from "react";
import "../styles/shipmentcard.css";

export default function ShipmentCard({ shipment }) {
  return (
    <div className="shipment-card">
      <div className="shipment-header">
        <h3 className="shipment-title">{shipment.title}</h3>
        <span className={`status-badge ${shipment.statusClass}`}>
          {shipment.status}
        </span>
      </div>
      
      <div className="shipment-route">
        <div className="route-point">
          <span className="route-dot origin-dot"></span>
          <span className="route-text">{shipment.origin}</span>
        </div>
        
        <div className="route-line">
          <div className="route-arrow">→</div>
        </div>
        
        <div className="route-point">
          <span className="route-dot destination-dot"></span>
          <span className="route-text">{shipment.destination}</span>
        </div>
      </div>
      
      <div className="shipment-details">
        <div className="eta-section">
          <span className="eta-label">ETA:</span>
          <span className="eta-value">{shipment.eta}</span>
        </div>
      </div>
      
      <div className="shipment-footer">
        <button className="track-btn">Track Shipment</button>
        <button className="details-btn">View Details</button>
      </div>
    </div>
  );
}