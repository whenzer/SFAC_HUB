import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginLanding from "./pages/login/LoginLanding";
import RegistrationPage from "./pages/login/RegistrationPage";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import StockAvailability from "./pages/StockAvailability";
import MakeReservation from "./pages/MakeReservation";
import LostAndFound from "./pages/LostAndFound";
import Reservations from "./pages/Reservations";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginLanding />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stock-availability" element={<StockAvailability />} />
        <Route path="/make-reservation" element={<MakeReservation />} />
        <Route path="/lost-and-found" element={<LostAndFound />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
