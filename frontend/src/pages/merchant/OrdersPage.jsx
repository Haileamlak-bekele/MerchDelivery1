
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMerchantOrders } from '../../hooks/useMerchantOrders';
import Sidebar from '../../components/Sidebar';
import {
  ShoppingCart,
  Clock,
  ThumbsUp,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  Eye,
  X,
  AlertCircle,
  Menu,
  UserCircle,
  MessageSquare
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

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
export default function OrdersPage() {
  const { orders, loading, error, confirmOrder } = useMerchantOrders();
  const order1 = orders || []; // Ensure orders is always an array
  console.log(order1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch active DSPs
  const [activeDsps, setActiveDsps] = useState([]);
  useEffect(() => {
    fetch('http://localhost:5000/users/dsps/getActiveDsps')
      .then(res => res.json())
      .then(setActiveDsps)
      .catch(console.error);
  }, []);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleChatWithDsp = (order) => {
    const dspId = typeof order.dspAssigned === 'object' ? order.dspAssigned._id : order.dspAssigned;
    const merchantId = order.items[0]?.product.merchantId || 'merchant123'; // Replace with actual merchantId source
    navigate(`/chat/${merchantId}/${dspId}`);
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      await confirmOrder(orderId);
      setIsOrderModalOpen(false);
    } catch (error) {
      console.error('Failed to confirm order:', error);
    }
  };

  // Callback to update order status
  const updateOrderStatus = (orderId, newStatus) => {
    setSelectedOrder((prevOrder) =>
      prevOrder && prevOrder._id === orderId
        ? { ...prevOrder, orderStatus: newStatus }
        : prevOrder
    );
  };

  const getStatusPill = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 items-center"><Clock size={14} className="mr-1.5" />Pending Confirmation</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 items-center"><ThumbsUp size={14} className="mr-1.5" />Confirmed - Awaiting Admin</span>;
      case 'approved':
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 items-center"><CheckCircle size={14} className="mr-1.5" />Admin Approved - DSP Assigned</span>;
      case 'shipped':
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 items-center"><Truck size={14} className="mr-1.5" />Shipped</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 items-center"><Package size={14} className="mr-1.5" />Delivered</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 items-center"><XCircle size={14} className="mr-1.5" />Cancelled</span>;
      case 'DspAssigned':
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 items-center"><CheckCircle size={14} className="mr-1.5" />DSP Assigned</span>;
      default:
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-700">{status}</span>;
    }
  };

  // Dummy inventoryItems for modal (remove if you have useInventory)
  const inventoryItems = [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-gray-200 font-sans">
      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center mb-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 mr-2"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <ShoppingCart className="w-7 h-7 mr-2 text-indigo-400" />
            Order Management
          </h1>
        </div>
        <div className="max-w-7xl mx-auto">
          {/* Header (hidden on mobile) */}
          <div className="hidden md:flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <ShoppingCart className="w-8 h-8 mr-3 text-indigo-400" />
              Order Management
            </h1>
          </div>
          {/* Table Content */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700/30">
                  <tr>
                    <th scope="col" className="px-6 py-3">Order ID</th>
                    <th scope="col" className="px-6 py-3">Customer</th>
                    <th scope="col" className="px-6 py-3">Date</th>
                    <th scope="col" className="px-6 py-3">Total</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-gray-400 text-lg">
                        <ShoppingCart size={48} className="mx-auto mb-2 text-gray-500" />
                        No orders to display yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition duration-150 ease-in-out group">
                        <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{order._id}</td>
                        <td className="px-6 py-4">{order.customer?.name || 'N/A'}</td>
                        <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">${order.totalAmount.toFixed(2)}</td>
                        <td className="px-6 py-4">{getStatusPill(order.orderStatus)}</td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="text-indigo-400 hover:text-indigo-300 p-1.5 rounded-md hover:bg-indigo-500/20 mr-2 transition duration-150 ease-in-out"
                            title="View Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {order.dspAssigned && (
                            <button
                              onClick={() => handleChatWithDsp(order)}
                              className="text-emerald-400 hover:text-emerald-300 p-1.5 rounded-md hover:bg-emerald-500/20 transition duration-150 ease-in-out"
                              title={`Chat with ${typeof order.dspAssigned === 'object' ? order.dspAssigned.name : 'DSP'}`}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Order Details Modal */}
          {isOrderModalOpen && selectedOrder && (
            <OrderDetailsModal
              isOpen={isOrderModalOpen}
              onClose={() => setIsOrderModalOpen(false)}
              order={selectedOrder}
              onConfirm={handleConfirmOrder}
              inventoryItems={inventoryItems}
              activeDsps={activeDsps}
              updateOrderStatus={updateOrderStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function OrderDetailsModal({ isOpen, onClose, order, onConfirm, inventoryItems, activeDsps, updateOrderStatus }) {
  const [selectedDspId, setSelectedDspId] = useState('');

  // Reset selected DSP when modal opens or order changes
  useEffect(() => {
    setSelectedDspId('');
  }, [isOpen, order?._id]);

  const handleAssignDsp = async (orderId, dspId) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`http://localhost:5000/orders/${orderId}/assign-dsp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ dspId, orderStatus: 'DspAssigned' }),
      });
      alert('DSP assigned successfully!');
      updateOrderStatus(orderId, 'DspAssigned'); // Update the status in the modal
      setSelectedDspId('');
      onClose();
    } catch (err) {
      alert('Failed to assign DSP');
    }
  };

  if (!isOpen || !order) return null;

  const getInventoryItemById = (productId) =>
    inventoryItems.find(item => item._id === productId);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out animate-fade-in">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-scale-in flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
          <h3 className="text-xl font-semibold text-white">Order Details: {order._id}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-600/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-indigo-300 mb-2">Customer Information</h4>
              <p><strong className="text-gray-400">Name:</strong> {order.customer?.name || 'N/A'}</p>
              <p><strong className="text-gray-400">Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              <p>
                <strong className="text-gray-400">Shipping Address:</strong>{' '}
                {order.deliveryLocation
                  ? typeof order.deliveryLocation === 'object'
                    ? (
                      <>
                        {order.deliveryLocation.lat}, {order.deliveryLocation.lng}{' '}
                        <a
                          href={`https://maps.google.com/?q=${order.deliveryLocation.lat},${order.deliveryLocation.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 underline ml-1"
                        >
                          (View on Map)
                        </a>
                      </>
                    )
                    : order.deliveryLocation
                  : 'N/A'}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-indigo-300 mb-2">Order Summary</h4>
              <p><strong className="text-gray-400">Status:</strong> {order.orderStatus}</p>
              <p><strong className="text-gray-400">Total Amount:</strong> ${order.totalAmount.toFixed(2)}</p>
              {order.dspAssigned && (
                <p>
                  <strong className="text-gray-400">DSP Assigned:</strong>{" "}
                  {typeof order.dspAssigned === "object"
                    ? `${order.dspAssigned.name} (${order.dspAssigned.email})`
                    : order.dspAssigned}
                </p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-indigo-300 mb-3">Items Ordered</h4>
            <ul className="space-y-3">
              {order.items.map((item, index) => {
                const inventoryItem = getInventoryItemById(item.product);
                const availableStock = inventoryItem ? inventoryItem.stock : 0;
                const hasEnoughStock = inventoryItem && availableStock >= item.quantity;
                const isOutOfStock = inventoryItem && availableStock === 0;

                return (
                  <li key={index} className="p-3 bg-gray-700/50 rounded-md border border-gray-600/70 flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 h-16">
                    <img
                                src={getImageUrl(item.product?.image)}
                                alt={item.product?.name || 'Product'}
                                className="w-16 h-16 object-cover rounded-md border border-gray-300 dark:border-gray-700 mr-4 bg-white"
                                onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/64x64'; }}
                              />
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium text-white">{item.product?.name || 'Product'} (x{item.quantity})</p>
                      <p className="text-sm text-gray-400">Price per unit: ${item.product?.price?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="text-right">
                      {inventoryItem ? (
                        <>
                          {isOutOfStock ? (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-500/20 text-red-300">Out of Stock</span>
                          ) : !hasEnoughStock ? (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">Low Stock (Avail: {availableStock})</span>
                          ) : (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500/20 text-green-300">In Stock (Avail: {availableStock})</span>
                          )}
                        </>
                      ) : (
                        <></>
                        // <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-500/20 text-gray-300">Info N/A</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            {order.items.some(item => {
              const invItem = getInventoryItemById(item.product);
              return !invItem || invItem.stock < item.quantity;
            }) && order.orderStatus === 'pending' && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md text-yellow-300 text-sm flex items-center">
                <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                <span>One or more items have insufficient stock. Confirming the order may lead to backorders or require inventory update.</span>
              </div>
            )}
          </div>
          <div className="mt-4">
    <label className="block text-sm font-medium text-gray-300 mb-1">Assign DSP:</label>
    <select
      className="w-full rounded-md p-2 bg-gray-700 text-white"
      value={selectedDspId}
      onChange={e => setSelectedDspId(e.target.value)}
    >
      <option value="">Select DSP</option>
      {activeDsps && activeDsps.length > 0 ? (
        activeDsps.map(dsp => (
          <option key={dsp._id} value={dsp._id}>
            {dsp.name} ({dsp.email})
          </option>
        ))
      ) : (
        <option disabled>No active DSPs available</option>
      )}
    </select>
    <button
      className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
      onClick={() => handleAssignDsp(order._id, selectedDspId)}
      disabled={!selectedDspId}
    >
      Assign DSP
    </button>
  </div>
        </div>

        {order.orderStatus === 'CONFIRMED' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Assign DSP:</label>
            <select
              className="w-full rounded-md p-2 bg-gray-700 text-white"
              value={selectedDspId}
              onChange={e => setSelectedDspId(e.target.value)}
            >
              <option value="">Select DSP</option>
              {activeDsps && activeDsps.length > 0 ? (
                activeDsps.map(dsp => (
                  <option key={dsp._id} value={dsp._id}>
                    {dsp.name} ({dsp.email})
                  </option>
                ))
              ) : (
                <option disabled>No active DSPs available</option>
              )}
            </select>
            <button
              className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              onClick={() => handleAssignDsp(order._id, selectedDspId)}
              disabled={!selectedDspId}
            >
              Assign DSP
            </button>
          </div>
        )}


        <div className="flex justify-end items-center pt-5 border-t border-gray-700/60 mt-auto space-x-3 sticky bottom-0 bg-gray-800 p-6 -mx-0 -mb-0 rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/70 rounded-md hover:bg-gray-600/70 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-150 ease-in-out">
            Close
          </button>
          {order.orderStatus === 'PENDING' && (
            <button
              onClick={() => onConfirm(order._id)}
              className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-150 ease-in-out shadow-md hover:shadow-lg flex items-center"
            >
              <CheckCircle size={18} className="mr-2" />
              Confirm Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
