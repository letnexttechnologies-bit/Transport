import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { shipmentAPI } from "../utils/api";
import "../styles/editshipment.css";

export default function EditShipment() {
  const { t } = useTranslation();
  const { shipmentId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    vehicleType: "",
    status: "Scheduled",
    origin: "",
    destination: "",
    eta: "",
    load: "",
    truck: "",
    container: "",
    weight: "",
    priority: false,
    image: "",
  });

  /* =========================
     LOAD SHIPMENT
  ========================= */
  useEffect(() => {
    const loadShipment = async () => {
      try {
        const response = await shipmentAPI.getById(shipmentId);
        const shipment = response.data;

        setFormData({
          vehicleType: shipment.vehicleType || "",
          status: shipment.status || "Pending",
          origin: shipment.origin || "",
          destination: shipment.destination || "",
          eta: shipment.date ? new Date(shipment.date).toISOString().split('T')[0] : "",
          load: shipment.load || "",
          truck: shipment.driver?.vehicleNumber || "",
          container: "",
          weight: shipment.weight || "",
          priority: false,
          image: "",
        });
      } catch (error) {
        console.error("Error loading shipment:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadShipment();
  }, [shipmentId]);

  /* =========================
     HANDLERS
  ========================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setFormData((p) => ({ ...p, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const shipmentData = {
        vehicleType: formData.vehicleType,
        origin: formData.origin,
        destination: formData.destination,
        load: formData.load,
        weight: parseFloat(formData.weight),
        date: formData.eta ? new Date(formData.eta) : new Date(),
        status: formData.status,
        price: 0, // You may want to add a price field
      };

      await shipmentAPI.update(shipmentId, shipmentData);
      alert(t("editShipment.updateSuccess") || "Shipment updated successfully");
      navigate(-1);
    } catch (error) {
      console.error("Error updating shipment:", error);
      alert(error.response?.data?.message || "Failed to update shipment");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t("shipments.deleteConfirm"))) return;

    try {
      await shipmentAPI.delete(shipmentId);
      alert(t("shipments.deleted") || "Shipment deleted");
      navigate("/dashboard?role=admin");
    } catch (error) {
      console.error("Error deleting shipment:", error);
      alert(error.response?.data?.message || "Failed to delete shipment");
    }
  };

  if (isLoading) return <div className="loading-state"><p>{t("shipmentDetails.loading")}</p></div>;

  return (
    <div className="edit-shipment-container">
      {/* HEADER */}
      <div className="edit-header">
        <h1>{t("editShipment.title")} <span className="shipment-id">#{shipmentId}</span></h1>
        <button className="back-button" onClick={() => navigate(-1)}>
          ← {t("form.back")}
        </button>
      </div>

      {/* FORM */}
      <form className="edit-form" onSubmit={handleSubmit}>
        <div className="form-sections">

          {/* BASIC INFO */}
          <div className="form-section">
            <h2>{t("shipmentDetails.routeInfo")}</h2>

            <div className="form-row">
              <div className="form-group">
                <label>{t("form.vehicleType")}</label>
                <input name="vehicleType" value={formData.vehicleType} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>{t("form.status")}</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Scheduled">{t("status.scheduled")}</option>
                  <option value="Pending">{t("status.pending")}</option>
                  <option value="In Transit">{t("status.inTransit")}</option>
                  <option value="At Warehouse">{t("status.atWarehouse")}</option>
                  <option value="Delivered">{t("status.delivered")}</option>
                  <option value="Cancelled">{t("status.cancelled")}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t("form.origin")}</label>
                <input name="origin" value={formData.origin} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>{t("form.destination")}</label>
                <input name="destination" value={formData.destination} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>{t("form.eta")}</label>
                <input type="date" name="eta" value={formData.eta} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>{t("form.loadDescription")}</label>
                <input name="load" value={formData.load} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>{t("form.truckType")}</label>
                <input name="truck" value={formData.truck} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>{t("form.container")}</label>
                <input name="container" value={formData.container} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>{t("form.weight")}</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} />
              </div>
            </div>

            <label>
              <input type="checkbox" name="priority" checked={formData.priority} onChange={handleChange} /> {t("form.priorityShipment")}
            </label>
          </div>

          {/* IMAGE */}
          <div className="form-section">
            <h2>{t("form.shipmentImage")}</h2>

            <div className="image-upload-area">
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="form-actions">
          <button type="button" className="btn btn-danger" onClick={handleDelete}>
            {t("buttons.delete")}
          </button>
          <div className="action-group">
            <button type="submit" className="btn btn-primary">
              {t("buttons.save")} {t("buttons.changes") || "Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
