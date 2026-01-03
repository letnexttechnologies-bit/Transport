import React from "react";  
import { useSearchParams, useNavigate } from "react-router-dom";  
import AdminDashboard from "./AdminDashboard";  
import UserDashboard from "./UserDashboard";  
import "../styles/dashboard.css";  
  
export default function Dashboard() {  
  const [searchParams] = useSearchParams();  
  const navigate = useNavigate();  
  const role = searchParams.get("role");  
  
  const isAdmin = role === "admin";  
  const isUser = role === "user";  
  
  // If no valid role, redirect to role selection  
  if (!isAdmin && !isUser) {  
    // Redirect to role selection or login  
    navigate("/roleselect");  
    return null;  
  }  
  
  // Render appropriate dashboard based on role  
  return isAdmin ? <AdminDashboard /> : <UserDashboard />;  
}  
