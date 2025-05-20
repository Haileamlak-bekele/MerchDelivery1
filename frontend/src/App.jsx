// Updated routing setup with role-based redirects using React Router

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import CustomerInterface from './pages/CustomerInterface';
import LiveDeliveryTracking from './pages/LiveDeliveryTracking';
import RegistrationSuccess from './pages/RegistrationSuccess';
import { Sun, Moon } from 'lucide-react';
import MerchantInventoryPage from './pages/MerchantInventoryPage';
import AdminPage from './pages/AdminDashboard';
import CartPage from './pages/CartPage';
import OrderPage from './components/checkout'

function AuthWrapper({ role }) {
  // Redirect based on role
  switch (role) {
    case 'customer':
      return <Navigate to="/customer" />;
    case 'merchant':
      return <Navigate to="/merchant" />;
    case 'dsp':
      return <Navigate to="/dsp" />;
         case 'admin':
      return <Navigate to="/admin"/>;
    default:
      return <Navigate to="/login" />;
  }
}

export default function AppRouter() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('appGlobalTheme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('appGlobalTheme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('appGlobalTheme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('appGlobalTheme')) {
        setIsDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900 transition-colors duration-300 font-sans">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/customer" element={<CustomerInterface />} />
          <Route path='/admin' element={<AdminPage />}/>
          <Route path="/merchant" element={<MerchantInventoryPage />} />
          <Route path="/dsp" element={<LiveDeliveryTracking />} />
          <Route path ="/admin" element={<AdminPage/>}/>
          <Route path="/registration-success" element={<RegistrationSuccess />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/redirect" element={<AuthWrapper role={localStorage.getItem('userRole')} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}