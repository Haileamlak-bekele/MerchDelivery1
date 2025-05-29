import React, { useState, useEffect } from 'react';

const ReportModal = ({ isOpen, onClose, onSubmit, order }) => {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const userId = user ? user._id : '';
  const [complaintData, setComplaintData] = useState({
    OrderId: '',
    CustomerId: '',
    merchantId: '',
    dspId: null,
    description: '',
    status: 'pending',
  });

  useEffect(() => {
    setComplaintData({
      OrderId: order?._id || '',
      CustomerId: userId || '',
      merchantId: order?.items?.[0]?.merchant?._id || '',
      dspId: order?.dspAssigned || null,
      description: '',
      status: 'pending',
    });
  }, [order, userId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setComplaintData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(complaintData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">File a Complaint</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Order ID</label>
          <input
            type="text"
            name="OrderId"
            value={complaintData.OrderId}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Merchant ID</label>
          <input
            type="text"
            name="merchantId"
            value={complaintData.merchantId}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">DSP ID</label>
          <input
            type="text"
            name="dspId"
            value={complaintData.dspId || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={complaintData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="4"
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            name="status"
            value={complaintData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
