import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./userlogin.css";

export default function UserLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    vehicleNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ---------------- REGISTER ----------------
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.age || !formData.gender || !formData.phone ||
      !formData.vehicleNumber || !formData.password || !formData.confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    const bodyData = {
      name: formData.name,
      age: Number(formData.age),
      gender: formData.gender,
      phone: formData.phone,
      vehicleNumber: formData.vehicleNumber,
      password: formData.password,
    };

    try {
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration Successful! Please login now.");
        setIsLogin(true);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    }
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.phone || !formData.password) {
      setError("Phone and Password are required");
      return;
    }

    const bodyData = {
      phone: formData.phone,
      password: formData.password,
    };

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        localStorage.setItem("currentUserName", data.user.name);
        localStorage.setItem("currentUserPhone", data.user.phone);
        localStorage.setItem("currentUserVehicle", data.user.vehicle);

        navigate(`/dashboard?userId=${data.user.id}&role=user`);
      } else {
        setError(data.message || "Invalid phone or password");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">
          {isLogin ? "User Login" : "User Registration"}
        </h2>

        {error && <div className="error-message">{error}</div>}

        {isLogin ? (
          <form onSubmit={handleLogin} className="user-login-form">
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                className="login-input"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
            </div>

            

            <div className="form-group">
              <label>Password *</label>
              <input
                className="login-input"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn user-btn">🔐 Login</button>

            <div className="auth-toggle">
              <p>Don't have an account?</p>
              <button type="button" className="toggle-btn" onClick={() => setIsLogin(false)}>
                Create new account
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="user-register-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  className="login-input"
                  type="text"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Age *</label>
                <input
                  className="login-input"
                  type="number"
                  placeholder="Age"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Gender *</label>
              <select
                className="login-input"
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                className="login-input"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Vehicle Number *</label>
              <input
                className="login-input"
                type="text"
                placeholder="Enter vehicle number"
                value={formData.vehicleNumber}
                onChange={(e) => handleInputChange("vehicleNumber", e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input
                  className="login-input"
                  type="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  className="login-input"
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="register-btn">📝 Register</button>

            <div className="auth-toggle">
              <p>Already have an account?</p>
              <button type="button" className="toggle-btn" onClick={() => setIsLogin(true)}>
                Login to existing account
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
