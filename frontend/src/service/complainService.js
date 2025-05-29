import axios from 'axios';

const API_URL = 'http://localhost:5000/complaints';

const getComplaints = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const getComplaint = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  console.log(response.data)
  return response.data;
};

const createComplaint = async (complaintData) => {
  const response = await axios.post(API_URL, complaintData);
  return response.data;
};

const updateComplaint = async (id, complaintData) => {
  const response = await axios.patch(`${API_URL}/${id}`, complaintData);
  return response.data;
};

const deleteComplaint = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

export default {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint,
};
