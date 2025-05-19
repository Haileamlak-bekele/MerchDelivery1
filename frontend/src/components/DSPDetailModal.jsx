import { useEffect, useState } from 'react';
import { Download, CheckCircle, XCircle } from 'react-feather';
import { API_BASE_URL } from '../config';
import { updateMerchantStatus } from '../service/User';

const MerchantDetailModal = ({ merchant, isOpen, onClose, onStatusUpdate }) => {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://placehold.co/60x60/7F848A/FFFFFF?text=N/A';
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    
    const normalizedPath = imagePath
      .replace(/\\/g, '/')
      .replace(/\/+/g, '/')
      .replace(/^[/.]+/, '')
      .replace(/^uploads/, '/uploads')
      .replace(/^\/?/, '/');
      
    return `${API_BASE_URL}${normalizedPath}`;
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
      resetForm();
    };
  }, [isOpen, onClose]);

  const resetForm = () => {
    setVerificationStatus(null);
    setVerificationNote('');
    setUpdateError(null);
  };

  const handleVerify = (status) => {
    setVerificationStatus(status);
    setUpdateError(null);
  };

  const handleDownload = () => {
  // Get the image URL
  const imageUrl = getImageUrl(merchant.merchantDetails?.tradeLicense);

  // Don't try to download placeholder images
  if (!imageUrl || imageUrl.includes('placehold.co')) {
    alert('No document available to download');
    return;
  }

  // Create a temporary link element
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = `${merchant.name.replace(/\s+/g, '-')}-business-license.jpg`;
  
  // Trigger the download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
};

  const handleStatusUpdate = async () => {
    if (!verificationStatus) {
      setUpdateError('Please select an approval status');
      return;
    }

    try {
      setIsUpdating(true);
      const updatedMerchant = await updateMerchantStatus(merchant._id, { 
        status: verificationStatus,
        note: verificationNote 
      });
      onClose();
    } catch (error) {
      setUpdateError('Failed to update merchant status. Please try again.');
      console.error('Update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !merchant) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left column - Document viewer */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Business License
                  </h3>
                </div>

                <div className="relative bg-black rounded-md overflow-hidden" style={{ height: '400px' }}>
                  <img 
                    src={getImageUrl(merchant.DspDetails?.drivingLicense)} 
                    alt="Business License document"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                </div>
              </div>

              {/* Right column - Verification and merchant info */}
              <div>
                {/* Merchant information */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">DSP Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle Details</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{merchant.DspDetails?.vehicleDetails}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Registration Date</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(merchant.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Available Status</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {merchant.DspDetails?.deliveryStatus}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {merchant.DspDetails?.approvalStatus}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verification section */}
                <div className="mb-6">                 
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="verificationNote" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Verification Notes
                      </label>
                      <textarea
                        id="verificationNote"
                        rows={6}
                        className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                        placeholder="Add any notes about this document..."
                        value={verificationNote}
                        onChange={(e) => setVerificationNote(e.target.value)}
                      />
                    </div>

                    {updateError && (
                      <div className="text-red-500 text-sm">{updateError}</div>
                    )}

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleVerify('approved')}
                        className={`flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                          verificationStatus === 'approved' ? 'ring-2 ring-offset-2 ring-green-500' : ''
                        }`}
                        disabled={isUpdating}
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Approve Document
                      </button>
                      <button
                        onClick={() => handleVerify('rejected')}
                        className={`flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                          verificationStatus === 'rejected' ? 'ring-2 ring-offset-2 ring-red-500' : ''
                        }`}
                        disabled={isUpdating}
                      >
                        <XCircle className="h-5 w-5 mr-2" />
                        Reject Document
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              onClick={onClose}
              disabled={isUpdating}
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleStatusUpdate}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-600 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              disabled={!verificationStatus || isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save Verification'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantDetailModal;