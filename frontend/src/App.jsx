// Updated routing setup with role-based redirects using React Router

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import Login from './Login';
import CustomerInterface from './CustomerInterface';
import MerchantInventoryMng from './MerchantInventoryMng';
import LiveDeliveryTracking from './LiveDeliveryTracking';

function AuthWrapper({ role }) {
  // Redirect based on role
  switch (role) {
    case 'customer':
      return <Navigate to="/customer" />;
    case 'merchant':
      return <Navigate to="/merchant" />;
    case 'dsp':
      return <Navigate to="/dsp" />;
    default:
      return <Navigate to="/login" />;
  }
}

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/customer" element={<CustomerInterface />} />
        <Route path="/merchant" element={<MerchantInventoryMng />} />
        <Route path="/dsp" element={<LiveDeliveryTracking />} />
        <Route path="/redirect" element={<AuthWrapper role={localStorage.getItem('userRole')} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}