import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const updateDeliveryPricing = async (basePrice, perKmRate, perKgRate) => {
  try {
    const response = await api.put('/admin/deliveryPricing', {
      basePrice,
      perKmRate,
      perKgRate,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating delivery pricing:', error);
    throw error;
  }
};

export const getDeliveryPricing = async () => {
  try {
    const response = await api.get('/admin/deliveryPricing');
    return response.data;
  } catch (error) {
    console.error('Error fetching delivery pricing:', error);
    throw error;
  }
};

export const fetchPlatformStats = async () => {
  try {
    const response = await api.get(`/admin/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    throw error; // Re-throw the error to handle it in the component
  }
};