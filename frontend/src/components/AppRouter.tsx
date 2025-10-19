import React from "react";
import { Routes, Route } from "react-router-dom";
import { protectedRoutes, publicRoutes } from "../config/routes";
import ProtectedRoute from "./ProtectedRoute";
import RoleBasedRoute from "./RoleBasedRoute";

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      {publicRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={React.createElement(route.element)} />
      ))}

      {/* Protected routes */}
      {protectedRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={route.allowedRoles} path={route.path}>
                {React.createElement(route.element)}
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
      ))}
    </Routes>
  );
};

export default AppRouter;
