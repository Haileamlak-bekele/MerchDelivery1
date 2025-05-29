// Updated routing setup with role-based redirects using React Router

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import LiveDeliveryTracking from './pages/LiveDeliveryTracking';
import RegistrationSuccess from './pages/RegistrationSuccess';
import CartPage from './pages/CartPage';
import { CustomersPage } from './pages/CustomerInterface';
import CheckoutPage from './components/checkout.jsx';
import MerchantInventoryPage from './pages/MerchantInventoryPage.jsx';
import OrdersPage from './pages/merchant/OrdersPage.jsx';
import AdminsPage from './pages/AdminDashboard.jsx';
import ChatPage  from './components/ChatPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ProfilePage from './pages/merchant/ProfilePage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import MerchantChatPage from './pages/MechantChatPage.jsx';

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
      return <Navigate to="/admin" />;
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
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/customer" element={<CustomersPage />} />
          <Route
            path="/merchant"
            element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <MerchantInventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute  allowedRoles={['merchant']}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['merchant', 'admin', 'dsp', 'customer']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dsp"
            element={
              <ProtectedRoute allowedRoles={['dsp']}>
                <LiveDeliveryTracking />
              </ProtectedRoute>
            }
          />
          <Route path="/registration-success" element={<RegistrationSuccess />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path='/order' element={<CheckoutPage />} />
          <Route path='/orders' element={<OrdersPage />} />
          <Route path="/admin" element={<AdminsPage />} />
          <Route path="/chat/:merchantId/:dspId" element={<ChatPage />} />
          <Route path="/chat/:merchatId/:customerId" element={<ChatPage />} />
          <Route path='/chat' element={<MerchantChatPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/redirect" element={<AuthWrapper role={localStorage.getItem('userRole')} />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/productDetail/:productId" element={<ProductDetailPage />} />
     
        </Routes>
      </div>
    </Router>
  );
}