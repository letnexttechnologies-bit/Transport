import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authAPI } from "../utils/api";
import "../styles/adminlogin.css";

export default function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.adminLogin(adminId, password);
      
      // Store admin data and token
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("currentUser", JSON.stringify(response.data));
      localStorage.setItem("currentUserName", response.data.name);
      localStorage.setItem("currentUserPhone", response.data.phone);

      navigate("/dashboard?role=admin");
    } catch (err) {
      setError(err.response?.data?.message || t("adminAuth.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* TITLE - Use specific key, not the whole object */}
        <h2 className="login-title">
          {t("adminAuth.title")}
        </h2>

        {/* ERROR MESSAGE */}
        {error && <div className="error-message">{error}</div>}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              className="login-input"
              type="text"
              placeholder={t("adminAuth.placeholder.adminId")}
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <input
              className="login-input"
              type="password"
              placeholder={t("adminAuth.placeholder.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn admin-btn" disabled={loading}>
            🔐 {loading ? t("common.loading") : t("adminAuth.button.login")}
          </button>
        </form>

      </div>
    </div>
  );
}