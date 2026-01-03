import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { bookingAPI, getImageUrl } from "../utils/api";
import "../styles/user-bookings-section.css";

export default function MyBookingsSection({
  userBookings = [],
  bookings = [],
  setBookings,
  onBookingDeleted,
}) {
  const { t } = useTranslation();

  // Format date (kept as is – dates are usually not translated)
  const formatDate = (dateString) => {
    if (!dateString) return t("myBookings.na"); // "N/A"
    const date = new Date(dateString);
    return `${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}, ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const [loading, setLoading] = useState({});

  /* =========================
     CANCEL BOOKING
  ========================= */
  const handleCancel = async (bookingId) => {
    try {
      setLoading((prev) => ({ ...prev, [bookingId]: true }));
      await bookingAPI.updateStatus(bookingId, "Cancelled");
      const updated = bookings.map((b) => {
        const id = b._id || b.id;
        return id === bookingId || id?.toString() === bookingId?.toString()
          ? { ...b, status: "Cancelled" }
          : b;
      });
      setBookings(updated);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert(error.response?.data?.message || "Failed to cancel booking");
    } finally {
      setLoading((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  /* =========================
     DELETE BOOKING
  ========================= */
  const handleDelete = async (bookingId) => {
    if (!window.confirm(t("myBookings.confirmDelete"))) return;

    try {
      setLoading((prev) => ({ ...prev, [bookingId]: true }));
      await bookingAPI.delete(bookingId);
      
      // Remove booking from local state
      const updated = bookings.filter((b) => {
        const id = b._id || b.id;
        return id !== bookingId && id?.toString() !== bookingId?.toString();
      });
      setBookings(updated);
      
      // Notify parent to refresh shipments
      if (onBookingDeleted) {
        onBookingDeleted();
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert(error.response?.data?.message || "Failed to delete booking");
    } finally {
      setLoading((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  return (
    <div className="user-my-bookings">
      <h2 className="user-section-title">
        {t("myBookings.title")} ({userBookings.length})
      </h2>

      {userBookings.length === 0 ? (
        <div className="user-empty-state">
          <p>{t("myBookings.noBookings")}</p>
        </div>
      ) : (
        <div className="user-bookings-grid">
          {userBookings.map((booking, index) => {
            const bookingId = booking._id || booking.id;
            const details = booking.shipmentDetails || booking.shipmentId || {};
            const status = booking.status.toLowerCase();
            // Ensure unique key by combining ID with index
            const uniqueKey = `${bookingId}-${index}`;

            return (
              <div
                key={uniqueKey}
                className={`user-booking-card user-status-${status}`}
              >
                {/* IMAGE */}
                {details.image && (
                  <div className="user-booking-image-section">
                    <img
                      src={getImageUrl(details.image)}
                      alt={t("myBookings.shipmentImage")}
                      className="user-booking-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* HEADER */}
                <div className="user-booking-header">
                  <h3>{t("myBookings.bookingId", { id: booking.bookingId || booking._id?.toString().slice(-6) || bookingId })}</h3>
                  <span className={`user-status-badge user-status-${status}`}>
                    {t(`status.${status}`) || booking.status} {/* e.g., status.pending → "Pending" */}
                  </span>
                </div>

                {/* DETAILS */}
                <div className="user-booking-details">
                  <p>
                    <strong>{t("myBookings.vehicle")}:</strong>{" "}
                    {details.vehicleType || t("myBookings.na")}
                  </p>
                  <p>
                    <strong>{t("myBookings.route")}:</strong>{" "}
                    {details.origin || t("myBookings.na")} →{" "}
                    {details.destination || t("myBookings.na")}
                  </p>
                  <p>
                    <strong>{t("myBookings.items")}:</strong>{" "}
                    {details.load || t("myBookings.na")}
                  </p>
                  <p>
                    <strong>{t("myBookings.bookedOn")}:</strong>{" "}
                    {formatDate(booking.bookedAt)}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="user-booking-actions">
                  {booking.status === "Pending" && (
                    <button
                      className="user-btn-cancel"
                      onClick={() => handleCancel(bookingId)}
                      disabled={loading[bookingId]}
                    >
                      {loading[bookingId] ? t("common.loading") : t("myBookings.cancel")}
                    </button>
                  )}

                  <button
                    className="user-btn-delete"
                    onClick={() => handleDelete(bookingId)}
                    disabled={loading[bookingId]}
                  >
                    {loading[bookingId] ? t("common.loading") : t("myBookings.delete")}
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