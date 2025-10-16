import React from "react";
import { Routes, Route } from "react-router-dom";
import { protectedRoutes, publicRoutes } from "../config/routes";
import ProtectedRoute from "./ProtectedRoute";

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
          element={<ProtectedRoute>{React.createElement(route.element)}</ProtectedRoute>}
        />
      ))}
    </Routes>
  );
};

export default AppRouter;
