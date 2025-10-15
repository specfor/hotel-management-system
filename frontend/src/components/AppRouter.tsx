import React from "react";
import { Routes, Route } from "react-router-dom";
import { routes } from "../config";

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {routes.map((route) => (
        <Route key={route.path} path={route.path} element={React.createElement(route.element)} />
      ))}
    </Routes>
  );
};

export default AppRouter;
