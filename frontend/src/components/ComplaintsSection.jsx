import React, { useState } from 'react';
import { Search, Eye, X } from 'lucide-react';
import useComplaints from '../hooks/useComplain';
import ComplaintModal from './ComplaintModal';
import MerchantDetailModal from './MerchantDetailModal';
import DSPDetailModal from './DSPDetailModal';

function ComplaintsSection() {
  const { complaints, loading, error, updateComplaintStatus, deleteComplaint } = useComplaints();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [isMerchantDetailModalOpen, setIsMerchantDetailModalOpen] = useState(false);
  const [selectedDsp, setSelectedDsp] = useState(null);
  const [isDspDetailModalOpen, setIsDspDetailModalOpen] = useState(false);

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const userID = user ? user._id : null;

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const openComplaintModal = (complaint) => {
    setSelectedComplaintId(complaint._id);
    setIsComplaintModalOpen(true);
  };

  const closeComplaintModal = () => {
    setIsComplaintModalOpen(false);
    setSelectedComplaintId(null);
  };

  const openMerchantDetailModal = (merchant) => {
    setSelectedMerchant(merchant);
    setIsMerchantDetailModalOpen(true);
  };

  const closeMerchantDetailModal = () => {
    setIsMerchantDetailModalOpen(false);
    setSelectedMerchant(null);
  };

  const openDspDetailModal = (dsp) => {
    setSelectedDsp(dsp);
    setIsDspDetailModalOpen(true);
  };

  const closeDspDetailModal = () => {
    setIsDspDetailModalOpen(false);
    setSelectedDsp(null);
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesStatus = statusFilter === 'All' || complaint.status === statusFilter;
    return matchesStatus;
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complaint Management</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition duration-150"
            />
          </div>
          <div className="ml-4 flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Status:</span>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md bg-white dark:bg-gray-700"
            >
              <option>All</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Complaint
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredComplaints.map((complaint) => (
                <tr key={complaint._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{complaint._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{complaint.OrderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{complaint.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      complaint.status === 'Resolved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                      complaint.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                    }`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openComplaintModal(complaint)}
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteComplaint(complaint._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 ml-2"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={closeComplaintModal}
        complaintId={selectedComplaintId}
        openMerchantDetailModal={openMerchantDetailModal}
        openDspDetailModal={openDspDetailModal}
      />

      <MerchantDetailModal
        isOpen={isMerchantDetailModalOpen}
        onClose={closeMerchantDetailModal}
        merchant={selectedMerchant}
      />

      <DSPDetailModal
        isOpen={isDspDetailModalOpen}
        onClose={closeDspDetailModal}
        dsp={selectedDsp}
      />
    </div>
  );
}

export default ComplaintsSection;
