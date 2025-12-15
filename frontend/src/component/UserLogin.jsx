import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./userlogin.css";
import { loginUser, registerUser } from "../api/api";

export default function UserLogin() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    vehicleNumber: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ================= REGISTER =================
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

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
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await registerUser({
        name,
        age: Number(age),
        gender,
        phone,
        vehicleNumber,
        password,
      });

      if (!res.success) {
        setError(res.message || "Registration failed");
        return;
      }

      alert("✅ Registration successful! Please login.");
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
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  // ================= LOGIN =================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.phone || !formData.password) {
      setError("Phone and Password are required");
      return;
    }

    try {
      const res = await loginUser({
        phone: formData.phone,
        password: formData.password,
      });

      if (!res.success) {
        setError(res.message || "Invalid phone or password");
        return;
      }

      // ✅ SAVE USER + TOKEN
      localStorage.setItem("token", res.token);
      localStorage.setItem("currentUser", JSON.stringify(res.user));

      // ✅ FIX: MongoDB uses _id
      navigate(`/dashboard?userId=${res.user._id}&role=user`);
    } catch (err) {
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
          // ================= LOGIN FORM =================
          <form onSubmit={handleLogin} className="user-login-form">
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                className="login-input"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) =>
                  handleInputChange("phone", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                className="login-input"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) =>
                  handleInputChange("password", e.target.value)
                }
              />
            </div>

            <button type="submit" className="login-btn user-btn">
              🔐 Login
            </button>

            <div className="auth-toggle">
              <p>Don't have an account?</p>
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setIsLogin(false)}
              >
                Create new account
              </button>
            </div>
          </form>
        ) : (
          // ================= REGISTER FORM =================
          <form onSubmit={handleRegister} className="user-register-form">
            <div className="form-row">
              <input
                className="login-input"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  handleInputChange("name", e.target.value)
                }
              />
              <input
                className="login-input"
                type="number"
                placeholder="Age"
                value={formData.age}
                onChange={(e) =>
                  handleInputChange("age", e.target.value)
                }
              />
            </div>

            <select
              className="login-input"
              value={formData.gender}
              onChange={(e) =>
                handleInputChange("gender", e.target.value)
              }
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <input
              className="login-input"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) =>
                handleInputChange("phone", e.target.value)
              }
            />

            <input
              className="login-input"
              placeholder="Vehicle Number"
              value={formData.vehicleNumber}
              onChange={(e) =>
                handleInputChange("vehicleNumber", e.target.value)
              }
            />

            <div className="form-row">
              <input
                className="login-input"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  handleInputChange("password", e.target.value)
                }
              />
              <input
                className="login-input"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
              />
            </div>

            <button type="submit" className="register-btn">
              📝 Register
            </button>

            <div className="auth-toggle">
              <p>Already have an account?</p>
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
