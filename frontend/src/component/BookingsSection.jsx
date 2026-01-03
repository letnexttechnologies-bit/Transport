import React, { forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { bookingAPI, getImageUrl } from "../utils/api";
import "../styles/bookings-section.css";

const BookingsSection = forwardRef(
  ({ bookings = [], setBookings, addNotification, onBookingDeleted }, ref) => {
    const { t } = useTranslation();

    /* =========================
       HELPERS
    ========================= */
    const safeStatus = (status) =>
      String(status || "Pending")
        .toLowerCase()
        .replace(/\s+/g, "-");

    const getStatusClass = (status) => {
      switch (status) {
        case "Pending":
          return "status-scheduled";
        case "Confirmed":
          return "status-confirmed";
        case "Cancelled":
          return "status-cancelled";
        case "In Transit":
          return "status-transit";
        case "Delivered":
          return "status-delivered";
        default:
          return "status-scheduled";
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return t("common.na");
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const [loading, setLoading] = useState({});

    /* =========================
       ACTIONS
    ========================= */
    const handleUpdateBookingStatus = async (bookingId, newStatus) => {
      try {
        setLoading((prev) => ({ ...prev, [bookingId]: true }));
        await bookingAPI.updateStatus(bookingId, newStatus);
        
        const updated = bookings.map((b) => {
          const id = b._id || b.id;
          return id === bookingId || id?.toString() === bookingId?.toString()
            ? { ...b, status: newStatus }
            : b;
        });

        setBookings(updated);
        addNotification(
          t("bookings.statusUpdated", {
            id: bookingId,
            status: t(`status.${newStatus.toLowerCase()}`),
          }),
          newStatus === "Approved" ? "success" : "warning"
        );
      } catch (error) {
        console.error("Error updating booking:", error);
        addNotification(
          error.response?.data?.message || t("bookings.updateFailed"),
          "error"
        );
      } finally {
        setLoading((prev) => ({ ...prev, [bookingId]: false }));
      }
    };

    const handleDeleteBooking = async (bookingId) => {
      if (!window.confirm(t("bookings.deleteConfirm"))) return;

      try {
        setLoading((prev) => ({ ...prev, [bookingId]: true }));
        await bookingAPI.delete(bookingId);
        
        const updated = bookings.filter((b) => {
          const id = b._id || b.id;
          return id !== bookingId && id?.toString() !== bookingId?.toString();
        });
        setBookings(updated);

        addNotification(
          t("bookings.deleted", { id: bookingId }),
          "info"
        );
        
        // Notify parent to refresh shipments
        if (onBookingDeleted) {
          onBookingDeleted();
        }
      } catch (error) {
        console.error("Error deleting booking:", error);
        addNotification(
          error.response?.data?.message || t("bookings.deleteFailed"),
          "error"
        );
      } finally {
        setLoading((prev) => ({ ...prev, [bookingId]: false }));
      }
    };

    /* =========================
       UI
    ========================= */
    return (
      <div className="bookings-section" ref={ref}>
        <div className="section-header">
          <h2 className="section-title">
            {t("bookings.allBookings")} ({bookings.length})
          </h2>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <p>{t("bookings.noBookings")}</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking, index) => {
              const bookingId = booking._id || booking.id;
              const statusClass = safeStatus(booking.status);
              // Ensure unique key by combining ID with index
              const uniqueKey = `${bookingId}-${index}`;

              return (
                <div
                  key={uniqueKey}
                  className={`booking-card status-${statusClass}`}
                >
                  {/* IMAGE */}
                  {booking.shipmentDetails?.image && (
                    <div className="booking-image-section">
                      <img
                        src={getImageUrl(booking.shipmentDetails.image)}
                        alt={t("bookings.shipmentImage")}
                        className="booking-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="booking-header">
                    <h3>
                      {t("bookings.booking")} #{booking.bookingId || booking._id?.toString().slice(-6) || bookingId}
                    </h3>
                    <span
                      className={`status-badge ${getStatusClass(
                        booking.status
                      )}`}
                    >
                      {t(`status.${(booking.status || "pending").toLowerCase()}`) || booking.status}
                    </span>
                  </div>

                  <div className="booking-info">
                    <div>
                      <strong>{t("bookings.user")}:</strong>{" "}
                      {booking.userName || t("common.unknownUser")}
                    </div>

                    <div>
                      <strong>{t("bookings.phone")}:</strong>{" "}
                      {booking.userId?.phone || t("common.na")}
                    </div>

                    <div>
                      <strong>{t("bookings.container")}:</strong>{" "}
                      {booking.shipmentDetails?.vehicleType || t("common.na")}
                    </div>

                    <div>
                      <strong>{t("bookings.vehicleNo")}:</strong>{" "}
                      {booking.userId?.vehicleNumber || booking.shipmentDetails?.vehicleNumber || t("common.na")}
                    </div>

                    <div className="booking-route">
                      <span className="origin">
                        {booking.shipmentDetails?.origin || t("common.na")}
                      </span>
                      <span className="arrow">→</span>
                      <span className="destination">
                        {booking.shipmentDetails?.destination || t("common.na")}
                      </span>
                    </div>

                    <div>
                      <strong>{t("bookings.booked")}:</strong>{" "}
                      {formatDate(booking.bookedAt)}
                    </div>
                  </div>

                  <div className="booking-actions">
                    {booking.status === "Pending" && (
                      <>
                        <button
                          className="btn-confirm"
                          onClick={() =>
                            handleUpdateBookingStatus(
                              bookingId,
                              "Approved"
                            )
                          }
                          disabled={loading[bookingId]}
                        >
                          {loading[bookingId] ? t("common.loading") : t("buttons.confirm")}
                        </button>

                        <button
                          className="btn-cancel"
                          onClick={() =>
                            handleUpdateBookingStatus(
                              bookingId,
                              "Rejected"
                            )
                          }
                          disabled={loading[bookingId]}
                        >
                          {loading[bookingId] ? t("common.loading") : t("buttons.cancel")}
                        </button>
                      </>
                    )}

                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteBooking(bookingId)}
                      disabled={loading[bookingId]}
                    >
                      {loading[bookingId] ? t("common.loading") : t("buttons.delete")}
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
);

BookingsSection.displayName = "BookingsSection";
export default BookingsSection;
