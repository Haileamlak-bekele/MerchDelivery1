import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import useComplaints from '../hooks/useComplain'; // Ensure the path is correct

const ComplaintModal = ({ isOpen, onClose, complaintId, openMerchantDetailModal, openDspDetailModal }) => {
  const [complaintData, setComplaintData] = useState(null);
  const { fetchComplaintById } = useComplaints(); // Use the hook to fetch complaint by ID

  useEffect(() => {
    if (isOpen && complaintId) {
      const fetchComplaint = async () => {
        const data = await fetchComplaintById(complaintId);
        setComplaintData(data);
      };
      fetchComplaint();
    }
  }, [isOpen, complaintId, fetchComplaintById]);

  if (!isOpen || !complaintData) return null;

  const { complaint, customer, merchant, dsp } = complaintData;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Complaint Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Complaint ID</p>
            <p className="text-sm text-gray-900 dark:text-white">{complaint._id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Order ID</p>
            <p className="text-sm text-gray-900 dark:text-white">{complaint.orderId}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer</p>
            <p className="text-sm text-gray-900 dark:text-white">{customer.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Merchant</p>
            <button
              onClick={() => openMerchantDetailModal(merchant)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {merchant.name}
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">DSP</p>
            {dsp ? (
              <button
                onClick={() => openDspDetailModal(dsp)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {dsp.name}
              </button>
            ) : (
              <p className="text-sm text-gray-900 dark:text-white">DSP not assigned</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Complaint</p>
            <p className="text-sm text-gray-900 dark:text-white">{complaint.description}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
            <p className="text-sm text-gray-900 dark:text-white">{complaint.status}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</p>
            <p className="text-sm text-gray-900 dark:text-white">{new Date(complaint.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintModal;
