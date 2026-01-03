import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "../styles/toast-notification.css";

export default function ToastNotification({ notification, onClose }) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!notification) return;
    
    // Show notification
    setIsVisible(true);
    console.log('ToastNotification: Showing notification', notification);

    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for animation to complete before calling onClose
      setTimeout(() => {
        onClose();
      }, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  // Get notification message
  const getMessage = () => {
    if (notification.msgKey) {
      try {
        return t(notification.msgKey, notification.params || {});
      } catch (error) {
        // If translation fails, use the msgKey or message as fallback
        return notification.message || notification.msg || notification.msgKey || notification.title || "";
      }
    }
    return notification.message || notification.msg || notification.title || "";
  };

  // Get notification type for styling
  const getType = () => {
    return notification.type || "info";
  };

  return (
    <div className={`toast-notification toast-${getType()} ${isVisible ? "toast-show" : "toast-hide"}`}>
      <div className="toast-content">
        <div className="toast-icon">
          {getType() === "success" && "✓"}
          {getType() === "error" && "✕"}
          {getType() === "warning" && "⚠"}
          {getType() === "info" && "ℹ"}
        </div>
        <div className="toast-message">{getMessage()}</div>
        <button className="toast-close" onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(), 300);
        }}>
          ×
        </button>
      </div>
    </div>
  );
}

