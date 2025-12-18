import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./userlogin.css";

// ========================= CONFIG =========================
const BASE_URL = "https://transport1-zy7c.onrender.com"; // Your Render backend
const API_URL = `${BASE_URL}/api/auth`; // ← FIXED: /api/auth, not /api + /auth

const registerUser = async (formData) => {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const contentType = res.headers.get("content-type");
    let data = {};
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    }

    if (!res.ok) {
      return { success: false, message: data.message || "Registration failed" };
    }

    return { success: true, message: data.message || "Registered successfully" };
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, message: "Network error. Try again." };
  }
};

const loginUser = async (formData) => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const contentType = res.headers.get("content-type");
    let data = {};
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    }

    if (!res.ok) {
      return { success: false, message: data.message || "Login failed" };
    }

    return {
      success: true,
      token: data.token,
      user: data.user,
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Network error. Try again." };
  }
};

// ========================= COMPONENT =========================
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

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const { name, age, gender, phone, vehicleNumber, password, confirmPassword } = formData;

    if (!name || !age || !gender || !phone || !vehicleNumber || !password || !confirmPassword) {
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

    const res = await registerUser({
      name,
      age: Number(age),
      gender,
      phone,
      vehicleNumber,
      password,
    });

    if (!res.success) {
      setError(res.message);
      return;
    }

    alert("✅ Registration successful! Now login.");
    setIsLogin(true);
    setFormData({ name: "", age: "", gender: "", phone: "", vehicleNumber: "", password: "", confirmPassword: "" });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const { phone, password } = formData;
    if (!phone || !password) {
      setError("Phone and password required");
      return;
    }

    const res = await loginUser({ phone, password });

    if (!res.success) {
      setError(res.message);
      return;
    }

    localStorage.setItem("token", res.token);
    localStorage.setItem("currentUser", JSON.stringify(res.user));

    navigate(`/dashboard?userId=${res.user._id}&role=user`);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">{isLogin ? "User Login" : "User Registration"}</h2>

        {error && <div className="error-message">{error}</div>}

        {isLogin ? (
          <form onSubmit={handleLogin} className="user-login-form">
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="login-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="login-input"
                required
              />
            </div>
            <button type="submit" className="login-btn user-btn">🔐 Login</button>

            <div className="auth-toggle">
              <p>Don't have an account?</p>
              <button type="button" className="toggle-btn" onClick={() => setIsLogin(false)}>
                Register
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="user-register-form">
            <div className="form-row">
              <input
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="login-input"
                required
              />
              <input
                type="number"
                placeholder="Age"
                value={formData.age}
                onChange={(e) => handleChange("age", e.target.value)}
                className="login-input"
                required
              />
            </div>

            <select
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="login-input"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <input
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="login-input"
              required
            />

            <input
              placeholder="Vehicle Number"
              value={formData.vehicleNumber}
              onChange={(e) => handleChange("vehicleNumber", e.target.value)}
              className="login-input"
              required
            />

            <div className="form-row">
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="login-input"
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className="login-input"
                required
              />
            </div>

            <button type="submit" className="register-btn">📝 Register</button>

            <div className="auth-toggle">
              <p>Already have an account?</p>
              <button type="button" className="toggle-btn" onClick={() => setIsLogin(true)}>
                Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}