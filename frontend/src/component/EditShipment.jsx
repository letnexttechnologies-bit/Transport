import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./editshipment.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function EditShipment() {
  const { shipmentId } = useParams();
  const navigate = useNavigate();

  const [shipmentData, setShipmentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

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

  // ===============================
  // FETCH SHIPMENT FROM BACKEND
  // ===============================
  useEffect(() => {
    const fetchShipment = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/shipments/${shipmentId}`);
        if (!res.ok) throw new Error("Failed to fetch shipment");

        const data = await res.json();
        setShipmentData(data);

        setFormData({
          vehicleType: data.vehicleType || "",
          status: data.status || "Scheduled",
          origin: data.origin || "",
          destination: data.destination || "",
          eta: data.eta || "",
          loadDescription: data.loadDescription || "",
          truckType: data.truckType || "",
          container: data.container || "",
          weight: data.weight || "",
          priority: data.priority || false,
          shipmentImage: data.shipmentImage || null
        });

        if (data.shipmentImage) {
          setImagePreview(data.shipmentImage);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShipment();
  }, [shipmentId]);

  // ===============================
  // INPUT HANDLERS
  // ===============================
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Only JPEG, PNG, GIF allowed");
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
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleImageDrop = (e) => {
    e.preventDefault();
    handleImageUpload({ target: { files: e.dataTransfer.files } });
  };

  // ===============================
  // UPDATE SHIPMENT
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vehicleType || !formData.origin || !formData.destination) {
      alert("Please fill required fields");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/shipments/${shipmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Update failed");

      alert("Shipment updated successfully!");
      navigate(-1);
    } catch (error) {
      console.error(error);
      alert("Failed to update shipment");
    }
  };

  // ===============================
  // DELETE SHIPMENT
  // ===============================
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this shipment?")) return;

    try {
      const res = await fetch(`${BASE_URL}/api/shipments/${shipmentId}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Delete failed");

      alert("Shipment deleted successfully!");
      navigate("/dashboard?role=admin");
    } catch (error) {
      console.error(error);
      alert("Failed to delete shipment");
    }
  };

  const handleCancel = () => navigate(-1);

  // ===============================
  // UI STATES
  // ===============================
  if (isLoading) {
    return <div className="edit-shipment-container">Loading shipment...</div>;
  }

  if (!shipmentData) {
    return (
      <div className="edit-shipment-container">
        <p>Shipment not found</p>
        <button onClick={() => navigate("/dashboard?role=admin")}>
          Back
        </button>
      </div>
    );
  }

  // ===============================
  // JSX (UNCHANGED UI)
  // ===============================
  return (
    <div className="edit-shipment-container">
      <div className="edit-header">
        <button className="back-button" onClick={handleCancel}>← Back</button>
        <h1>Edit Shipment</h1>
        <div className="shipment-id">ID: #{shipmentId}</div>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
        {/* UI CONTENT REMAINS SAME */}
        {/* Your existing JSX stays exactly as-is */}
        {/* Buttons */}
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
