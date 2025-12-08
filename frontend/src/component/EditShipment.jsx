import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./editshipment.css";

export default function EditShipment() {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const [shipmentData, setShipmentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    vehicleType: "",
    status: "Scheduled",
    origin: "",
    destination: "",
    eta: "",
    loadDescription: "",
    truckType: "",
    container: "",
    weight: "",
    priority: false,
    shipmentImage: null
  });

  // Load shipment data from localStorage
  useEffect(() => {
    const savedShipments = localStorage.getItem('shipments');
    if (savedShipments) {
      const shipments = JSON.parse(savedShipments);
      const currentShipment = shipments.find(shipment => shipment.id === shipmentId);
      
      if (currentShipment) {
        setShipmentData(currentShipment);
        setFormData({
          vehicleType: currentShipment.vehicleType || "",
          status: currentShipment.status || "Scheduled",
          origin: currentShipment.origin || "",
          destination: currentShipment.destination || "",
          eta: currentShipment.eta || "",
          loadDescription: currentShipment.loadDescription || "",
          truckType: currentShipment.truckType || "",
          container: currentShipment.container || "",
          weight: currentShipment.weight || "",
          priority: currentShipment.priority || false,
          shipmentImage: currentShipment.shipmentImage || null
        });
        
        if (currentShipment.shipmentImage) {
          setImagePreview(currentShipment.shipmentImage);
        }
      }
    }
    setIsLoading(false);
  }, [shipmentId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert("Only JPEG, PNG, and GIF files are allowed");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData(prev => ({
          ...prev,
          shipmentImage: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const inputEvent = {
        target: {
          files: [file]
        }
      };
      handleImageUpload(inputEvent);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.vehicleType || !formData.origin || !formData.destination) {
      alert("Please fill in all required fields");
      return;
    }

    // Update shipment in localStorage
    const savedShipments = localStorage.getItem('shipments');
    if (savedShipments) {
      const shipments = JSON.parse(savedShipments);
      const updatedShipments = shipments.map(shipment => 
        shipment.id === shipmentId 
          ? { 
              ...shipment, 
              ...formData, 
              lastUpdated: new Date().toISOString() 
            }
          : shipment
      );
      
      // FIXED: Save to correct localStorage key
      localStorage.setItem('shipments', JSON.stringify(updatedShipments));
      alert("Shipment updated successfully!");
      
      // FIXED: Navigate to correct previous page
      navigate(-1); // This will go back to the previous page
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this shipment?")) {
      // FIXED: Use correct localStorage key
      const savedShipments = localStorage.getItem('shipments');
      if (savedShipments) {
        const shipments = JSON.parse(savedShipments);
        const updatedShipments = shipments.filter(shipment => shipment.id !== shipmentId);
        
        // FIXED: Save to correct localStorage key
        localStorage.setItem('shipments', JSON.stringify(updatedShipments));
        alert("Shipment deleted successfully!");
        
        // FIXED: Navigate to dashboard
        navigate('/dashboard?role=admin');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="edit-shipment-container">
        <div className="loading-state">
          <p>Loading shipment data...</p>
        </div>
      </div>
    );
  }

  if (!shipmentData) {
    return (
      <div className="edit-shipment-container">
        <div className="error-state">
          <p>Shipment not found</p>
          <button onClick={() => navigate('/dashboard?role=admin')} className="back-button">
            Back to Shipments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-shipment-container">
      <div className="edit-header">
        <button className="back-button" onClick={handleCancel}>
          ← Back
        </button>
        <h1>Edit Shipment</h1>
        <div className="shipment-id">ID: #{shipmentId}</div>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-sections">
          {/* Shipment Image Section */}
          <div className="form-section">
            <h2>Shipment Image</h2>
            <div 
              className="image-upload-area"
              onDrop={handleImageDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('image-upload').click()}
            >
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Shipment preview" />
                  <div className="image-overlay">
                    <span>Click to change image</span>
                  </div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-icon">📁</div>
                  <p>Drag & Drop or Click to Upload</p>
                  <span className="upload-hint">Supports: JPEG, PNG, GIF (Max 5MB)</span>
                </div>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Shipment Information Section */}
          <div className="form-section">
            <h2>Shipment Information</h2>
            
            <div className="form-group">
              <label htmlFor="vehicleType" className="required">Vehicle Type *</label>
              <input
                type="text"
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                placeholder="e.g., Heavy Machinery Transport"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <input
                type="text"
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                placeholder="e.g., Scheduled, In Transit, Delivered"
              />
            </div>

            <div className="form-group">
              <label htmlFor="origin" className="required">Origin *</label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                placeholder="Type or select from suggestions"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="destination" className="required">Destination *</label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="Type or select from suggestions"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="eta">ETA</label>
              <input
                type="text"
                id="eta"
                name="eta"
                value={formData.eta}
                onChange={handleInputChange}
                placeholder="e.g., 2 days"
              />
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="form-section">
            <h2>Additional Details</h2>
            
            <div className="form-group">
              <label htmlFor="loadDescription">Load Description</label>
              <input
                type="text"
                id="loadDescription"
                name="loadDescription"
                value={formData.loadDescription}
                onChange={handleInputChange}
                placeholder="e.g., Construction Equipment"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="truckType">Truck Type</label>
                <input
                  type="text"
                  id="truckType"
                  name="truckType"
                  value={formData.truckType}
                  onChange={handleInputChange}
                  placeholder="e.g., Freightliner Cascadia"
                />
              </div>

              <div className="form-group">
                <label htmlFor="container">Container</label>
                <input
                  type="text"
                  id="container"
                  name="container"
                  value={formData.container}
                  onChange={handleInputChange}
                  placeholder="e.g., 40ft Flatbed"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight</label>
              <input
                type="text"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="e.g., 20,000 kg"
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="priority"
                  checked={formData.priority}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                Priority Shipment
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button type="button" className="btn btn-danger" onClick={handleDelete}>
            Delete Shipment
          </button>
          <div className="action-group">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}