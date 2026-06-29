import { Navigate } from "react-router-dom";
import type { JSX } from "react";

interface PrivateRouteProps {
  children: JSX.Element;
  allowed: "admin" | "user"|"seller";
}

export default function PrivateRoute({ children, allowed }: PrivateRouteProps) {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("user");
console.log(userType); console.log(token);
  if (!token) {
    // Not logged in → go to correct login page
    return allowed === "admin" ? (
      <Navigate to="/login" replace />
    ) : 
    allowed==='user'?
    (
      <Navigate to="/user/login" replace />
    ):
    (
      <Navigate to="seller/dashboard" replace />
    )
  }

  // Logged in but wrong type
  if (userType !== allowed) {
    return userType === "admin" ? (
      <Navigate to="/dashboard" replace />
    ) : (
      <Navigate to="/user/dashboard" replace />
    );
  }

  // ✅ All good
  return children;
}
