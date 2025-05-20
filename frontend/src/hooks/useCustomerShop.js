import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export const useCustomerShop = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to get auth token
  const getAuthToken = () => localStorage.getItem('authToken');

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/customers/allProducts`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setProducts(res.data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cart
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/customers/viewCart`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setCart(res.data.cart || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add to cart
  const addToCart = useCallback(async (productId, quantity = 1) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/customers/addToCart`, { productId, quantity }, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      await fetchCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // Place order
  const placeOrder = useCallback(async ({ customerId, deliveryLocation, paymentPrice }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/orders/place`, { customerId, deliveryLocation, paymentPrice }, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      await fetchCart(); // Clear cart after order
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // Update cart item quantity
  const updateCartItem = useCallback(async (cartItemId, quantity) => {
    setLoading(true);
    setError(null);
    try {
      await axios.put(`${API_BASE_URL}/api/customer/cart/${cartItemId}`, { quantity }, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      await fetchCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update cart item');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // Delete cart item
  const deleteCartItem = useCallback(async (cartItemId) => {
    setLoading(true);
    setError(null);
    try {
      // Optimistically update the cart state
      setCart(prevCart => prevCart.filter(item => item._id !== cartItemId));
      
      // Make the API call
      await axios.delete(`${API_BASE_URL}/customers/cart/${cartItemId}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      
      // If successful, no need to do anything as we already updated the state
    } catch (err) {
      // If there's an error, revert the cart state and show error
      await fetchCart(); // Refresh cart to get the correct state
      setError(err.response?.data?.message || 'Failed to delete cart item');
      console.error('Delete cart item error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, [fetchProducts, fetchCart]);

  return {
    products,
    cart,
    loading,
    error,
    fetchProducts,
    fetchCart,
    addToCart,
    placeOrder,
    setError,
    updateCartItem,
    deleteCartItem
  };
}; 