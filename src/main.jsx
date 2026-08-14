import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import TripsDashboard from "./TripsDashboard";
import TripEditor from "./TripEditor";
import './index.css';


ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<TripsDashboard />} />
      <Route path="/trip/:tripId" element={<TripEditor />} />
    </Routes>
  </BrowserRouter>
);
