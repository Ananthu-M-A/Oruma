import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthRole, getCurrentUser } from "../lib/auth";

type ProtectedRouteProps = {
  children: React.ReactElement;
  allowedRoles?: AuthRole[];
};

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
