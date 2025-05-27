import { useState, useEffect } from 'react';
import complaintService from '../service/complainService';

const useComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComplaints = async () => {
    try {
      const data = await complaintService.getComplaints();
      setComplaints(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const addComplaint = async (complaintData) => {
    try {
      const newComplaint = await complaintService.createComplaint(complaintData);
      setComplaints([...complaints, newComplaint]);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateComplaintStatus = async (id, status) => {
    try {
      const updatedComplaint = await complaintService.updateComplaint(id, { status });
      setComplaints(complaints.map(complaint => complaint._id === id ? updatedComplaint : complaint));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteComplaint = async (id) => {
    try {
      await complaintService.deleteComplaint(id);
      setComplaints(complaints.filter(complaint => complaint._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return { complaints, loading, error, addComplaint, updateComplaintStatus, deleteComplaint, fetchComplaints };
};

export default useComplaints;
