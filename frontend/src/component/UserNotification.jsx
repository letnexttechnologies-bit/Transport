import React from "react";
import { useTranslation } from "react-i18next";
import { userNotificationAPI } from "../utils/api";
import "../styles/user-notification.css";

export default function UserNotification({
  notifications,
  setNotifications,
  showNotifications,
  setShowNotifications,
}) {
  const { t } = useTranslation();

  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        // If invalid date, try to parse as timestamp or return formatted string
        const timestamp = parseInt(timeString);
        if (!isNaN(timestamp)) {
          const dateFromTimestamp = new Date(timestamp);
          if (!isNaN(dateFromTimestamp.getTime())) {
            return dateFromTimestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
          }
        }
        return ""; // Return empty if can't parse
      }
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "";
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    
    if (!window.confirm(t("notifications.confirmClearAll") || "Are you sure you want to delete all notifications?")) {
      return;
    }

    try {
      await userNotificationAPI.deleteAll();
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
      alert(error.response?.data?.message || t("notifications.clearAllFailed") || "Failed to clear notifications");
    }
  };

  return (
    <div className="user-notification-wrapper">
      {/* 🔔 Bell Icon */}
      <div
        className="user-notification-bell"
        onClick={() => setShowNotifications(!showNotifications)}
        aria-label={t("notifications.title")}
      >
        <img src="notification.png" alt={t("notifications.title")} />

        {notifications.length > 0 && (
          <span className="user-notification-badge">
            {notifications.length > 99 ? "99+" : notifications.length}
          </span>
        )}
      </div>

      {/* 📥 Dropdown */}
      {showNotifications && (
        <div className="user-notification-dropdown">
          <div className="user-notification-header">
            <h4>{t("notifications.title")}</h4>

            {notifications.length > 0 && (
              <button onClick={handleClearAll}>
                {t("notifications.clearAll")}
              </button>
            )}
          </div>

          <div className="user-notification-list">
            {notifications.length === 0 ? (
              <p className="user-no-notifications">
                {t("notifications.noNotifications")}
              </p>
            ) : (
              notifications.slice(0, 10).map((n, index) => (
                <div
                  key={n._id || n.id || `notification-${index}`}
                  className={`user-notification-item ${n.type || ""}`}
                >
                  {/* ✅ TRANSLATION FIX HERE */}
                  <div>
                    {n.msgKey
                      ? t(n.msgKey, n.params || {})
                      : n.message || n.msg}
                  </div>

                  <small>{formatTime(n.time || n.createdAt)}</small>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
