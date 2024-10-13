import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface IRequirePermissionProps {
  permission: string;
  children: React.ReactNode;
}

const RequirePermission = ({
  permission,
  children,
}: IRequirePermissionProps) => {
  const location = useLocation();
  const storedPermissions = localStorage.getItem("permissions");
  const permissions = storedPermissions ? JSON.parse(storedPermissions) : null;

  const hasPermission = permissions.some((p) => p.name === permission);
  if (!hasPermission) {
    return <Navigate to="/dashboard/unauthorized" state={{ from: location }} />;
  }

  return children;
};

export default RequirePermission;
