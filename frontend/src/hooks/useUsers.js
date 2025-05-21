import { useState, useEffect } from 'react';
import { fetchUsers, fetchMerchants,updateMerchantStatus, fetchDSP } from '../service/User';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [dsps, setDsps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [usersData, merchantsData,dspUsers] = await Promise.all([
        fetchUsers(),
        fetchMerchants(),
        fetchDSP()
      ]);

      
      setUsers(usersData);
      setMerchants(merchantsData);
      setDsps(dspUsers);
    } catch (err) {
      setError('Failed to load user data. Please try again later.');
      console.error('Error fetching user data:', err);
      // Reset all states on error
      setUsers([]);
      setMerchants([]);
      setDsps([]);
    } finally {
      setIsLoading(false);
    }
  };
const updateStatus = async (id, newStatus) => {
    try {
      
      const updatedMerchant = await updateMerchantStatus(id, { aprrovalStatus: newStatus });
      return updatedMerchant;
    } catch (err) {
      setError('Failed to update status');
      console.error('Update error:', err);
    } 
  };
  // Filter users by role
  const getUsersByRole = (role) => {
    return users.filter(user => user.role === role);
  };

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    users,
    merchants,
    dsps,
    isLoading,
    error,
    updateStatus,
    getUsersByRole,
    refresh: fetchAllData
  };
};