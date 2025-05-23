import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const fetchMerchants = async () => {
  const response = await api.get('/admin/merchant');
  console.log("merchants", response.data);
  return response.data;
};

export const fetchDSP = async () => {
  const response = await api.get('/admin/dsp');
  console.log(response.data);
  return response.data;
};

export const updateMerchantStatus = async (id, status) => {
  const approvalStatus = status;
  const response = await api.put(`/admin/approve/${id}`, approvalStatus);
  return response.data;
};

export const deleteUsers = async (id) => {
  const response = await api.delete(`/admin/user/${id}`);
  return response.data;
}

export const fetchMerchantProfile = async () => {
  const response = await api.get('/merchant/profile');
  return response.data;
};
