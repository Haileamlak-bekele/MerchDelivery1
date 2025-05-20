import { useState } from 'react';
import { useMerchantOrders } from '../../hooks/useMerchantOrders';
// import { useInventory } from '../../hooks/useInventory';
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
  AlertCircle
} from 'lucide-react';

export default function OrdersPage() {
  const { orders, loading, error, confirmOrder } = useMerchantOrders();
  const { inventoryItems } = useInventory();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      await confirmOrder(orderId);
      setIsOrderModalOpen(false);
    } catch (error) {
      console.error('Failed to confirm order:', error);
    }
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
      default:
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-700">{status}</span>;
    }
  };

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
    <div className="max-w-7xl mx-auto text-white">
      <div className="flex items-center mb-8">
        <ShoppingCart className="w-8 h-8 mr-3 text-indigo-400" />
        <h1 className="text-3xl font-bold">Order Management</h1>
      </div>

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
                    <td className="px-6 py-4">{getStatusPill(order.status)}</td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-indigo-400 hover:text-indigo-300 p-1.5 rounded-md hover:bg-indigo-500/20 mr-2 transition duration-150 ease-in-out"
                        title="View Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOrderModalOpen && selectedOrder && (
        <OrderDetailsModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          order={selectedOrder}
          onConfirm={handleConfirmOrder}
          inventoryItems={inventoryItems}
        />
      )}
    </div>
  );
}

function OrderDetailsModal({ isOpen, onClose, order, onConfirm, inventoryItems }) {
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
              <p><strong className="text-gray-400">Shipping Address:</strong> {order.deliveryLocation}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-indigo-300 mb-2">Order Summary</h4>
              <p><strong className="text-gray-400">Status:</strong> {order.status}</p>
              <p><strong className="text-gray-400">Total Amount:</strong> ${order.totalAmount.toFixed(2)}</p>
              {order.dspAssigned && <p><strong className="text-gray-400">DSP Assigned:</strong> {order.dspAssigned}</p>}
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
                  <li key={index} className="p-3 bg-gray-700/50 rounded-md border border-gray-600/70 flex justify-between items-center">
                    <div>
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
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-500/20 text-gray-300">Info N/A</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            {order.items.some(item => {
              const invItem = getInventoryItemById(item.product);
              return !invItem || invItem.stock < item.quantity;
            }) && order.status === 'pending' && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md text-yellow-300 text-sm flex items-center">
                <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                <span>One or more items have insufficient stock. Confirming the order may lead to backorders or require inventory update.</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end items-center pt-5 border-t border-gray-700/60 mt-auto space-x-3 sticky bottom-0 bg-gray-800 p-6 -mx-0 -mb-0 rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/70 rounded-md hover:bg-gray-600/70 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-150 ease-in-out">
            Close
          </button>
          {order.status === 'pending' && (
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