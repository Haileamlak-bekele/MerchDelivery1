// useUsers.js
import { useState, useEffect } from 'react';
import { fetchUsers, fetchMerchants, updateMerchantStatus, fetchDSP, deleteUsers } from '../service/User';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [dsps, setDsps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userFilter, setUserFilter] = useState({ name: '', status: null });

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [usersData, merchantsData, dspUsers] = await Promise.all([
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

  // Filter users based on name and status
  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesName = userFilter.name ? user.name.toLowerCase().includes(userFilter.name.toLowerCase()) : true;
      const matchesStatus = userFilter.status ? user.status === userFilter.status : true;
      return matchesName && matchesStatus;
    });
  };

  // Filter merchants based on name, business name, email, and status
  const getFilteredMerchants = () => {
    return merchants.filter(merchant => {
      const matchesName = merchant.name.toLowerCase().includes(userFilter.name.toLowerCase());
      const matchesBusinessName = merchant.merchantDetails?.storeName.toLowerCase().includes(userFilter.name.toLowerCase());
      const matchesEmail = merchant.email.toLowerCase().includes(userFilter.name.toLowerCase());
      const matchesStatus = userFilter.status ? merchant.merchantDetails?.approvalStatus === userFilter.status : true;
      return (matchesName || matchesBusinessName || matchesEmail) && matchesStatus;
    });
  };

  // Filter DSPs based on name, vehicle details, email, and status
  const getFilteredDsps = () => {
    return dsps.filter(dsp => {
      const matchesName = dsp.name.toLowerCase().includes(userFilter.name.toLowerCase());
      const matchesVehicleDetails = dsp.DspDetails?.vehicleDetails.toLowerCase().includes(userFilter.name.toLowerCase());
      const matchesEmail = dsp.email.toLowerCase().includes(userFilter.name.toLowerCase());
      const matchesStatus = userFilter.status ? dsp.DspDetails?.approvalStatus === userFilter.status : true;
      return (matchesName || matchesVehicleDetails || matchesEmail) && matchesStatus;
    });
  };

  // Function to update the filter criteria
  const setFilter = (filter) => {
    setUserFilter(filter);
  };

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
    getFilteredUsers,
    getFilteredMerchants,
    getFilteredDsps, // Function to get filtered DSPs
    setFilter, // Function to set filter criteria
    refresh: fetchAllData
  };
};
