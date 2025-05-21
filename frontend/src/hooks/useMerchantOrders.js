import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export function useMerchantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to get auth token
  const getAuthToken = () => localStorage.getItem('authToken');

  // Fetch merchant orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/merchant/orders`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Confirm order
  const confirmOrder = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      await axios.patch(`${API_BASE_URL}/merchant/orders/${orderId}/confirm`, {}, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    confirmOrder,
    setError,
  };
} 