import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Function to fetch product by ID
export const fetchProductById = async (productId) => {
  try {
    const response = await api.get(`/feedback/product/${productId}`);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Product not found');
  }
};

// Function to fetch comments for a product
export const fetchCommentsByProductId = async (productId) => {
  const response = await api.get(`/feedback/comments/${productId}`);
  console.log('comments is fetched')
  return response.data;
};

// Function to add a new comment
export const addComment = async (productId, comment) => {
  const response = await api.post(`/feedback/comment/${productId}`, comment);
  console.log('comments is fetched')
  return response.data;
};

// Function to fetch related products
export const fetchRelatedProducts = async () => {
  const response = await api.get('/rea/products');
  return response.data;
};
