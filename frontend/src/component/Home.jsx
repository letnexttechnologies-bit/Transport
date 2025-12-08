import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

export default function Home() {
  const nav = useNavigate();

  return (
    <div className="role-container">
      <div className="role-card">
        <div className="emoji">🚚</div>

        <h2 className="role-title">Transport Loading Service</h2>
        <p className="role-subtitle">Select your role to continue</p>

        <button
          className="role-btn admin"
          onClick={() => nav("/admin-login")}
        >
          Admin Login
        </button>
        <br/>
        <button
          className="role-btn user"
          onClick={() => nav("/user-login")}
        >
          User Login
        </button>
      </div>
    </div>
  );
}
