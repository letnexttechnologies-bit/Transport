import React, { forwardRef, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { shipmentAPI, getImageUrl } from "../utils/api";
import "../styles/shipments-section.css";

const ShipmentsSection = forwardRef(
  (
    {
      shipments = [],
      setShipments,
      searchTerm = "",
      addNotification = () => {},
      navigate,
      userId = "admin",
      role = "admin",
      onDeleteShipment,
    },
    ref
  ) => {
    const { t } = useTranslation();

    const [showAddForm, setShowAddForm] = useState(false);

    const [newShipment, setNewShipment] = useState({
      vehicleType: "",
      status: "Pending",
      origin: "",
      destination: "",
      date: "",
      load: "",
      truck: "",
      container: "",
      weight: "",
      eta: "",
      priority: false,
      image: "",
    });

    const fileInputRef = useRef(null);


    /* =========================
       IMAGE UPLOAD
    ========================= */
    const handleImageUpload = (file) => {
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        addNotification(t("shipments.imageOnly"), "warning");
        return;
      }

      if (file.size > 1 * 1024 * 1024) {
        addNotification(t("shipments.imageSize"), "warning");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setNewShipment((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    };

    /* =========================
       ID GENERATOR
    ========================= */
    const generateShipmentId = () => {
      const nums = shipments
        .map((s) => parseInt(String(s.id || "").replace("SH", ""), 10))
        .filter(Number.isFinite);

      const next = nums.length ? Math.max(...nums) + 1 : 1001;
      return `SH${next}`;
    };

    /* =========================
       ADD SHIPMENT
    ========================= */
    const handleAddShipment = async (e) => {
      e.preventDefault();

      // Validate required fields
      const requiredFields = [
        "vehicleType",
        "origin",
        "destination",
        "load",
        "weight",
      ];

      for (let field of requiredFields) {
        const value = newShipment[field];
        if (!value || (typeof value === 'string' && !value.trim())) {
          addNotification(
            t("shipments.fieldRequired", {
              field: t(`form.${field}`),
            }),
            "warning"
          );
          return;
        }
      }

      // Validate weight is a number
      const weightNum = parseFloat(newShipment.weight);
      if (isNaN(weightNum) || weightNum <= 0) {
        addNotification(
          t("shipments.invalidWeight") || "Weight must be a positive number",
          "warning"
        );
        return;
      }

      // Validate date
      if (!newShipment.date) {
        addNotification(
          t("shipments.dateRequired") || "Date is required",
          "warning"
        );
        return;
      }

      try {
        const formData = new FormData();
        formData.append('vehicleType', newShipment.vehicleType);
        formData.append('origin', newShipment.origin);
        formData.append('destination', newShipment.destination);
        formData.append('load', newShipment.load);
        formData.append('weight', parseFloat(newShipment.weight) || 0);
        formData.append('date', newShipment.date ? new Date(newShipment.date).toISOString() : new Date().toISOString());
        formData.append('eta', newShipment.eta || '');
        formData.append('status', newShipment.status || 'Pending');
        
        // Add image file if selected
        if (fileInputRef.current?.files?.[0]) {
          formData.append('image', fileInputRef.current.files[0]);
        } else if (newShipment.image && newShipment.image.startsWith('data:')) {
          // If it's a base64 image, convert to blob
          const response = await fetch(newShipment.image);
          const blob = await response.blob();
          formData.append('image', blob, 'image.jpg');
        }

        const response = await shipmentAPI.create(formData);
        const newShipmentData = response.data;

        setShipments((prev) => [...prev, newShipmentData]);
        addNotification(
          t("shipments.created", { id: newShipmentData.shipmentId || newShipmentData._id || newShipmentData.id }),
          "success"
        );

        setShowAddForm(false);
        setNewShipment({
          vehicleType: "",
          status: "Pending",
          origin: "",
          destination: "",
          date: "",
          load: "",
          truck: "",
          container: "",
          weight: "",
          eta: "",
          priority: false,
          image: "",
        });

        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
        console.error('Shipment creation error:', error);
        const errorMessage = error.response?.data?.message || 
                            (error.response?.data?.errors ? 
                              Object.values(error.response.data.errors).join(', ') : 
                              t("shipments.createFailed"));
        addNotification(errorMessage, "error");
      }
    };

    /* =========================
       FILTER
    ========================= */
    const filteredShipments = shipments.filter((s) => {
      if (!searchTerm) return true;
      const tSearch = searchTerm.toLowerCase();
      const id = s._id || s.id || "";
      return (
        id.toString().toLowerCase().includes(tSearch) ||
        s.origin?.toLowerCase().includes(tSearch) ||
        s.destination?.toLowerCase().includes(tSearch) ||
        s.vehicleType?.toLowerCase().includes(tSearch) ||
        s.load?.toLowerCase().includes(tSearch) ||
        s.status?.toLowerCase().includes(tSearch)
      );
    });

    const statusClass = {
      Scheduled: "status-scheduled",
      "In Transit": "status-transit",
      "At Warehouse": "status-warehouse",
      Delivered: "status-delivered",
      Cancelled: "status-cancelled",
    };

    const statusKeyMap = {
      Scheduled: "scheduled",
      "In Transit": "inTransit",
      "At Warehouse": "atWarehouse",
      Delivered: "delivered",
      Cancelled: "cancelled",
    };

    const formatDate = (iso) =>
      new Date(iso).toLocaleDateString("en-IN");

    /* =========================
       RENDER
    ========================= */
    return (
      <div className="shipments-section" ref={ref}>
        <div className="section-header">
          <h2>
            {t("tabs.shipments")} ({filteredShipments.length})
          </h2>

          <button className="btn-primary" onClick={() => setShowAddForm(true)}>
            {t("shipments.new")}
          </button>
        </div>

        {/* ADD SHIPMENT FORM */}
        {showAddForm && (
          <div className="add-form-modal">
            <form className="add-form" onSubmit={handleAddShipment}>
              <h3>{t("shipments.addTitle")}</h3>

              <input
                type="text"
                placeholder={t("form.vehicleType")}
                value={newShipment.vehicleType}
                onChange={(e) =>
                  setNewShipment({ ...newShipment, vehicleType: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder={t("form.origin")}
                value={newShipment.origin}
                onChange={(e) =>
                  setNewShipment({ ...newShipment, origin: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder={t("form.destination")}
                value={newShipment.destination}
                onChange={(e) =>
                  setNewShipment({ ...newShipment, destination: e.target.value })
                }
                required
              />
              <input
                type="date"
                placeholder={t("form.date") || "Date"}
                value={newShipment.date}
                onChange={(e) =>
                  setNewShipment({ ...newShipment, date: e.target.value })
                }
              />
              <input
                type="text"
                placeholder={t("form.load")}
                value={newShipment.load}
                onChange={(e) =>
                  setNewShipment({ ...newShipment, load: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder={t("form.weight")}
                value={newShipment.weight}
                onChange={(e) =>
                  setNewShipment({ ...newShipment, weight: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder={t("form.eta") || "ETA"}
                value={newShipment.eta}
                onChange={(e) =>
                  setNewShipment({ ...newShipment, eta: e.target.value })
                }
              />
              <select
                value={newShipment.status}
                onChange={(e) =>
                  setNewShipment({ ...newShipment, status: e.target.value })
                }
                style={{
                  width: '100%',
                  marginBottom: '1rem',
                  padding: '0.9rem 1.2rem',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  fontSize: '0.95rem',
                }}
              >
                <option value="Scheduled">{t("status.scheduled")}</option>
                <option value="Pending">{t("status.pending")}</option>
                <option value="In Transit">{t("status.inTransit")}</option>
                <option value="At Warehouse">{t("status.atWarehouse")}</option>
                <option value="Delivered">{t("status.delivered")}</option>
                <option value="Cancelled">{t("status.cancelled")}</option>
              </select>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => handleImageUpload(e.target.files[0])}
              />

              {newShipment.image && (
                <img
                  src={newShipment.image}
                  alt={t("shipments.preview")}
                  className="preview-img"
                />
              )}

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {t("common.save")}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SHIPMENTS LIST */}
        <div className="shipments-grid">
          {filteredShipments.map((s, index) => {
            const shipmentId = s._id || s.id;
            // Ensure unique key by combining ID with index
            const uniqueKey = `${shipmentId}-${index}`;
            return (
            <div key={uniqueKey} className="shipment-card">
              <div className="shipment-header">
                <div>
                  <strong>{s.shipmentId || shipmentId}</strong>
                  <div>{s.vehicleType}</div>
                </div>

                <span className={`status-badge ${statusClass[s.status] || 'status-scheduled'}`}>
                  {s.status && statusKeyMap[s.status] 
                    ? t(`status.${statusKeyMap[s.status]}`) 
                    : (t(`status.${(s.status || 'pending').toLowerCase()}`) || s.status || 'Pending')}
                </span>
              </div>

              {s.image && (
                <img 
                  src={getImageUrl(s.image)} 
                  alt={t("shipments.image")} 
                  className="shipment-card-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              )}

              <p>
                {s.origin} → {s.destination}
              </p>
              <p>{t("form.load")}: {s.load}</p>
              <p>{t("form.weight")}: {s.weight}</p>
              <p>{t("form.eta")}: {s.eta}</p>

              <div className="shipment-actions">
                <button
                  onClick={() =>
                    navigate(
                      `/shipment-details/${shipmentId}?userId=${userId}&role=${role}`
                    )
                  }
                >
                  {t("common.details")}
                </button>

                <button
                  className="action-btn primary"
                  onClick={() => navigate(`/edit-shipment/${shipmentId}`)}
                >
                  {t("common.edit")}
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(t("shipments.deleteConfirm"))) {
                      onDeleteShipment?.(shipmentId);
                    }
                  }}
                >
                  {t("common.delete")}
                </button>
              </div>

              <small>
                {t("common.created")}: {formatDate(s.createdAt)}
              </small>
            </div>
            );
          })}
        </div>
      </div>
    );
  }
);

ShipmentsSection.displayName = "ShipmentsSection";
export default ShipmentsSection;
