import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./adminlogin.css";

export default function AdminLogin() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (adminId === "o" && password === "o") {
      navigate("/dashboard?role=admin");
    } else {
      setError("Invalid Admin ID or Password");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Admin Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <input 
            className="login-input" 
            type="text" 
            placeholder="Admin ID" 
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            required
          />
          <br/>
          <br/>
          <input 
            className="login-input" 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <button type="submit" className="login-btn admin-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}