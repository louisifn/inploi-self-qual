import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { router } from "./router";
import { AccessGate } from "./components/AccessGate";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Framer animations are JS-driven, so honour prefers-reduced-motion globally here. */}
    <MotionConfig reducedMotion="user">
      <AccessGate>
        <RouterProvider router={router} />
      </AccessGate>
    </MotionConfig>
  </React.StrictMode>,
);
