import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("token");
  const authUser = JSON.parse(localStorage.getItem("authUser"));

  // No token or no logged-in user
  if (!token || !authUser) {
    return <Navigate to="/" replace />;
  }

  // Check if user role is allowed
  if (!allowedRoles.includes(authUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
