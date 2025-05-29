import React, { useState, useEffect } from 'react';
import { Upload, DollarSign } from 'lucide-react';
import { fetchPlatformSettings } from '../service/Service';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentPage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedBank, setSelectedBank] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [platformSettings, setPlatformSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Try to get merchantId and dspId from location.state, props, or localStorage
  let merchantId = location.state?.merchantId || props.merchantId;
  let dspId = location.state?.dspId || props.dspId;

  // Fetch platform settings (bank accounts and registration prices)
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPlatformSettings();
        setPlatformSettings(data);
      } catch (err) {
        setError('Failed to load payment settings.');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Get registration price based on role
  const paymentAmount = platformSettings
    ? (merchantId ? platformSettings.registrationPriceMerchant : dspId ? platformSettings.registrationPriceDSP : '')
    : '';

  // Bank details for each bank (from platformSettings)
  const bankAccounts = platformSettings?.bankAccounts || [];
  const selectedBankDetails = selectedBank ? bankAccounts.find(b => b.bankName === selectedBank) : null;

  const handleBankChange = (event) => {
    setSelectedBank(event.target.value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (validTypes.includes(file.type) && file.size <= maxSize) {
        setPaymentScreenshot(file);
        setPreviewUrl(URL.createObjectURL(file));
        console.log('File selected:', file);
      } else {
        alert('Please upload a valid image file (PNG, JPG, GIF) up to 10MB.');
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccess(null);
    setError(null);

    if (!paymentScreenshot) {
      alert('Please upload a payment screenshot.');
      setIsSubmitting(false);
      return;
    }
    if (!merchantId && !dspId) {
      setError('Merchant or DSP ID is required for payment upload.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('paymentProof', paymentScreenshot);
    if (merchantId) {
      formData.append('merchantId', merchantId);
    } else if (dspId) {
      formData.append('dspId', dspId);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/users/upload-payment-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Payment proof uploaded successfully!');
      setPaymentScreenshot(null);
      setPreviewUrl(null);

      // Redirect to registration-success after a short delay
      setTimeout(() => {
        navigate('/registration-success', { state: { role: merchantId ? 'merchant' : 'dsp' } });
      }, 1000); // 1 second delay for user feedback

    } catch (error) {
      setError(
        error.response?.data?.message || 'An error occurred while uploading the payment proof.'
      );
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Loading payment details...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <DollarSign className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Complete Your Payment
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            You are about to pay a total of <span className="font-semibold">{paymentAmount} Birr</span> for registration as a <span className="capitalize">{merchantId ? 'merchant' : dspId ? 'dsp' : ''}</span>.
          </p>
        </div>

<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="bank" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Bank
              </label>
              <select
                id="bank"
                name="bank"
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                value={selectedBank}
                onChange={handleBankChange}
              >
                <option value="" disabled>Select a bank</option>
                {bankAccounts.map((bank, idx) => (
                  <option key={idx} value={bank.bankName}>{bank.bankName}</option>
                ))}
              </select>
            </div>

            {selectedBankDetails && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                <h4 className="text-md font-medium text-green-600 dark:text-green-400">Bank Account Details</h4>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Bank Name:</span> {selectedBankDetails.bankName}
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Account Number:</span> {selectedBankDetails.bankAccountNumber}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Payment Screenshot
              </label>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Complete your payment using the bank details provided above and upload a screenshot of the payment confirmation.
              </p>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                    >
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>
              </div>
              {previewUrl && (
                <div className="mt-4">
                  <h4 className="text-md font-medium text-green-600 dark:text-green-400">Preview</h4>
                  <img src={previewUrl} alt="Preview" className="mt-2 max-w-full h-auto rounded-md" />
                </div>
              )}
            </div>
          </div>

          {success && <div className="text-green-600 dark:text-green-400 mb-2">{success}</div>}
          {error && <div className="text-red-600 dark:text-red-400 mb-2">{error}</div>}

<div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : `Pay ${paymentAmount} Birr`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;