import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { fetchPaymentAccount, fetchTransactionsByAccountId } from '../../service/Service';
import { fetchMerchantProfile } from '../../service/User';
import { API_BASE_URL } from '../../config';
import { Eye } from 'lucide-react';

function getImageUrl(imagePath, baseUrl = API_BASE_URL) {
  if (!imagePath) {
    return 'https://placehold.co/64x64';
  }
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  if (imagePath.startsWith('/uploads')) {
    return `${baseUrl}${imagePath}`;
  }
  let normalizedPath = imagePath
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')
    .replace(/^[/.]+/, '')
    .replace(/^uploads/, '/uploads')
    .replace(/^\/?/, '/');
  return `${baseUrl}${normalizedPath}`;
}

export default function ProfilePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [paymentAccount, setPaymentAccount] = useState(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountError, setAccountError] = useState(null);
  const [merchantProfile, setMerchantProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);
  const [modalTx, setModalTx] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);

  useEffect(() => {
    fetchMerchantProfile()
      .then(setMerchantProfile)
      .catch(setProfileError)
      .finally(() => setProfileLoading(false));
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('User from localStorage:', user);
    if (user && user._id) {
      fetchPaymentAccount(user._id)
        .then((account) => {
          console.log('Fetched payment account:', account);
          setPaymentAccount(account);
          if (account && account._id) {
            fetchTransactionsByAccountId(account._id)
              .then(setTransactions)
              .catch(setTransactionsError)
              .finally(() => setTransactionsLoading(false));
          } else {
            setTransactionsLoading(false);
          }
        })
        .catch(setAccountError)
        .finally(() => setAccountLoading(false));
    } else {
      setAccountLoading(false);
      setAccountError('User not found');
      setTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (modalTx && modalTx.reference) {
      setOrderLoading(true);
      setOrderError(null);
      const token = localStorage.getItem('authToken');
      fetch(`${API_BASE_URL}/orders/${modalTx.reference}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch order details');
          return res.json();
        })
        .then(data => setOrderDetails(data.order))
        .catch(setOrderError)
        .finally(() => setOrderLoading(false));
    } else {
      setOrderDetails(null);
    }
  }, [modalTx]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-gray-200 font-sans">
      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>
          {/* Merchant Info */}
          <div className="mb-8">
            {profileLoading ? (
              <div className="text-gray-400">Loading merchant info...</div>
            ) : profileError ? (
              <div className="text-red-400">{profileError.message || profileError}</div>
            ) : merchantProfile ? (
              <div className="bg-gray-800/80 border border-gray-600 rounded-lg px-6 py-4 mb-4 shadow">
                <div className="mb-2"><span className="font-semibold text-indigo-300">Merchant Name:</span> {merchantProfile.userId?.name}</div>
                <div className="mb-2"><span className="font-semibold text-indigo-300">Email:</span> {merchantProfile.userId?.email}</div>
                <div className="mb-2"><span className="font-semibold text-indigo-300">Phone Number:</span> {merchantProfile.userId?.phoneNumber}</div>
                <div className="mb-2"><span className="font-semibold text-indigo-300">Store Name:</span> {merchantProfile.storeName}</div>
                {/* <div className="mb-2"><span className="font-semibold text-indigo-300">Trade License:</span> {merchantProfile.tradeLicense}</div> */}
                <div className="mb-2"><span className="font-semibold text-indigo-300">Location:</span> {merchantProfile.location ? `${merchantProfile.location.lat}, ${merchantProfile.location.lng}` : 'N/A'}</div>
                <div className="mb-2"><span className="font-semibold text-indigo-300">Approval Status:</span> {merchantProfile.approvalStatus}</div>
              </div>
            ) : null}
          </div>
          {/* Payment Account Info */}
          <div className="mb-8">
            {accountLoading ? (
              <div className="text-gray-400">Loading account...</div>
            ) : accountError ? (
              <div className="text-red-400">
                {accountError.response && accountError.response.status === 404
                  ? 'No payment account found. Please contact support or wait for approval.'
                  : (accountError.message || accountError)}
              </div>
            ) : paymentAccount ? (
              <div className="bg-indigo-800/80 border border-indigo-400 rounded-lg px-6 py-4 flex items-center gap-6 shadow">
                <span className="text-lg font-semibold text-white">Account Balance:</span>
                <span className="text-2xl font-bold text-emerald-400">${paymentAccount.balance.toFixed(2)}</span>
                <span className="ml-4 text-sm text-indigo-200">Status: {paymentAccount.status}</span>
              </div>
            ) : null}
          </div>
          {/* Transaction Table */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
            {transactionsLoading ? (
              <div className="text-gray-400">Loading transactions...</div>
            ) : transactionsError ? (
              <div className="text-red-400">{transactionsError.message || transactionsError}</div>
            ) : transactions.length === 0 ? (
              <div className="text-gray-400">No transactions found.</div>
            ) : (
              <div className="overflow-x-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Reason</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">From</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${tx.amount.toFixed(2)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{tx.reason}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{tx.from?.name || 'N/A'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(tx.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {/* <button
                            className="text-indigo-500 hover:underline focus:outline-none"
                            onClick={() => setModalTx(tx)}
                          >
                            View Details
                          </button> */}
                          <button
                            onClick={() => setModalTx(tx)}
                            className="text-indigo-400 hover:text-indigo-300 p-1.5 rounded-md hover:bg-indigo-500/20 mr-2 transition duration-150 ease-in-out"
                            title="View Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Transaction Details Modal */}
            {modalTx && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300"
                style={{
                  background: 'rgba(16, 24, 40, 0.65)',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  animation: 'fadeInOverlay 0.3s',
                }}
              >
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-0 relative overflow-hidden">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-indigo-600 dark:bg-indigo-800">
                    <h3 className="text-lg font-bold text-white">Transaction Details</h3>
                    <button
                      className="text-white text-2xl font-bold hover:text-emerald-300 focus:outline-none"
                      onClick={() => setModalTx(null)}
                      aria-label="Close"
                    >
                      &times;
                    </button>
                  </div>
                  {/* Modal Body */}
                  <div className="px-6 py-5 space-y-4 text-gray-800 dark:text-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div><strong>Transaction ID:</strong><br /> <span className="break-all">{modalTx._id}</span></div>
                      <div><strong>Amount:</strong><br /> <span className="text-emerald-600 dark:text-emerald-400 font-bold">${modalTx.amount.toFixed(2)}</span></div>
                      <div><strong>Reason:</strong><br /> {modalTx.reason}</div>
                      {/* <div><strong>Type:</strong><br /> {modalTx.type}</div> */}
                      <div><strong>Reference:</strong><br /> {modalTx.reference || 'N/A'}</div>
                      <div><strong>From:</strong><br /> {modalTx.from?.name || 'N/A'} <span className="block text-xs text-gray-500">{modalTx.from?.email || ''}</span></div>
                      <div><strong>Date:</strong><br /> {new Date(modalTx.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="mt-4">
                      <strong className="block mb-2 text-indigo-700 dark:text-indigo-300">Product(s) in this Order:</strong>
                      {orderLoading ? (
                        <div>Loading product details...</div>
                      ) : orderError ? (
                        <div className="text-red-500">Failed to load product details.</div>
                      ) : orderDetails && orderDetails.items.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                          {orderDetails.items.map((item, idx) => (
                            <div key={idx} className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                              <img
                                src={getImageUrl(item.product?.image)}
                                alt={item.product?.name || 'Product'}
                                className="w-16 h-16 object-cover rounded-md border border-gray-300 dark:border-gray-700 mr-4 bg-white"
                                onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/64x64'; }}
                              />
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 dark:text-white">{item.product?.name || 'N/A'}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>No product details available.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Add more profile info here if needed */}
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
} 