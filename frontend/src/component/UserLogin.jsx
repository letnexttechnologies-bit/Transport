import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authAPI } from "../utils/api";
import "../styles/userlogin.css";


export default function UserLogin() {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    vehicleNumber: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ========================= REGISTER ========================= */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const {
      name,
      age,
      gender,
      phone,
      vehicleNumber,
      password,
      confirmPassword,
    } = formData;

    if (
      !name ||
      !age ||
      !gender ||
      !phone ||
      !vehicleNumber ||
      !password ||
      !confirmPassword
    ) {
      setError(t("userLogin.errors.allFieldsRequired"));
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t("userLogin.errors.passwordMismatch"));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t("userLogin.errors.passwordTooShort"));
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register({
        name,
        age: parseInt(age),
        gender,
        phone,
        vehicleNumber,
        password,
      });

      // Store user data and token
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("currentUser", JSON.stringify(response.data));
      localStorage.setItem("currentUserName", response.data.name);
      localStorage.setItem("currentUserPhone", response.data.phone);
      localStorage.setItem("currentUserVehicle", response.data.vehicleNumber);

      alert(t("userLogin.alerts.registrationSuccess"));
      setIsLogin(true);
      setFormData({
        name: "",
        age: "",
        gender: "",
        phone: "",
        vehicleNumber: "",
        password: "",
        confirmPassword: "",
      });
      navigate(`/dashboard?userId=${response.data._id}&role=user`);
    } catch (err) {
      setError(err.response?.data?.message || t("userLogin.errors.registrationFailed"));
    } finally {
      setLoading(false);
    }
  };

  /* ========================= LOGIN ========================= */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { phone, password } = formData;

    if (!phone || !password) {
      setError(t("userLogin.errors.phonePasswordRequired"));
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.login(phone, password);

      // Store user data and token
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("currentUser", JSON.stringify(response.data));
      localStorage.setItem("currentUserName", response.data.name);
      localStorage.setItem("currentUserPhone", response.data.phone);
      localStorage.setItem("currentUserVehicle", response.data.vehicleNumber);

      navigate(`/dashboard?userId=${response.data._id}&role=user`);
    } catch (err) {
      setError(err.response?.data?.message || t("userLogin.errors.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">
          {isLogin ? t("userLogin.loginTitle") : t("userLogin.registerTitle")}
        </h2>

        {error && <div className="error-message">{error}</div>}

        {isLogin ? (
          /* ================= LOGIN FORM ================= */
          <form onSubmit={handleLogin} className="user-login-form">
            <div className="form-group">
              <label>{t("userLogin.labels.phone")} *</label>
              <input
                className="login-input"
                type="tel"
                placeholder={t("userLogin.placeholders.phone")}
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>{t("userLogin.labels.password")} *</label>
              <input
                className="login-input"
                type="password"
                placeholder={t("userLogin.placeholders.password")}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
            </div>

            <button type="submit" className="login-btn user-btn" disabled={loading}>
              🔐 {loading ? t("common.loading") : t("userLogin.buttons.login")}
            </button>

            <div className="auth-toggle">
              <p>{t("userLogin.toggle.noAccount")}</p>
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setIsLogin(false)}
              >
                {t("userLogin.toggle.createAccount")}
              </button>
            </div>
          </form>
        ) : (
          /* ================= REGISTER FORM ================= */
          <form onSubmit={handleRegister} className="user-register-form">
            <div className="form-row">
              <div className="form-group">
                <label>{t("userLogin.labels.name")} *</label>
                <input
                  className="login-input"
                  type="text"
                  placeholder={t("userLogin.placeholders.name")}
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{t("userLogin.labels.age")} *</label>
                <input
                  className="login-input"
                  type="number"
                  placeholder={t("userLogin.placeholders.age")}
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t("userLogin.labels.gender")} *</label>
              <select
                className="login-input"
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
              >
                <option value="">{t("userLogin.placeholders.selectGender")}</option>
                <option value="Male">{t("userLogin.gender.male")}</option>
                <option value="Female">{t("userLogin.gender.female")}</option>
                <option value="Other">{t("userLogin.gender.other")}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t("userLogin.labels.phone")} *</label>
              <input
                className="login-input"
                type="tel"
                placeholder={t("userLogin.placeholders.phone")}
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>{t("userLogin.labels.vehicleNumber")} *</label>
              <input
                className="login-input"
                type="text"
                placeholder={t("userLogin.placeholders.vehicleNumber")}
                value={formData.vehicleNumber}
                onChange={(e) => handleInputChange("vehicleNumber", e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t("userLogin.labels.password")} *</label>
                <input
                  className="login-input"
                  type="password"
                  placeholder={t("userLogin.placeholders.createPassword")}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{t("userLogin.labels.confirmPassword")} *</label>
                <input
                  className="login-input"
                  type="password"
                  placeholder={t("userLogin.placeholders.confirmPassword")}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="register-btn" disabled={loading}>
              📝 {loading ? t("common.loading") : t("userLogin.buttons.register")}
            </button>

            <div className="auth-toggle">
              <p>{t("userLogin.toggle.haveAccount")}</p>
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setIsLogin(true)}
              >
                {t("userLogin.toggle.loginExisting")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}