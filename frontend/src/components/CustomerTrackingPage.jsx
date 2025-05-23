import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin, MessageSquare, Star, AlertCircle, Send, LocateFixed, User, ShoppingBag, Clock, X, ThumbsUp, ThumbsDown,
  ChevronDown, ArrowLeft, CheckCircle, Truck, Loader2, ChevronRight, ListOrdered, PackageCheck, CheckCircle2,
  Heart, Filter, ChevronUp, ShoppingCart, Search, Trash2, Settings, LogOut, Info, Phone, Sun, Moon, Package
} from 'lucide-react';
import { API_BASE_URL } from '../config'; // <-- Add this import

// Mock Data - Replace with API calls in a real application

const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const initialActiveOrdersData = [
  {
    id: 'order123',
    items: [{ name: 'Large Pepperoni Pizza', quantity: 1 }, { name: 'Coke (2L)', quantity: 1 }],
    restaurantName: 'Luigi\'s Pizzeria',
    dsp: { name: 'Marco', vehicle: 'Scooter - PLATE789', location: { lat: 34.0522, lng: -118.2437 }, rating: 4.8 },
    eta: 25, // minutes
    status: 'Out for Delivery', // Processing, Out for Delivery, Delivered, Confirmed Reception, Confirmed & Rated
    customerLocation: { lat: 34.0622, lng: -118.2537 },
    deliveryAddress: '123 Customer St, Your City',
    estimatedDeliveryTime: '7:15 PM',
    orderPlacedTime: '6:30 PM'
  },
  {
    id: 'order456',
    items: [{ name: 'Sushi Platter', quantity: 1 }, { name: 'Miso Soup', quantity: 2 }],
    restaurantName: 'Sakura Sushi',
    dsp: { name: 'Kenji', vehicle: 'Bike - CYCLE02', location: { lat: 34.0700, lng: -118.2500 }, rating: 4.9 },
    eta: 0,
    status: 'Delivered',
    customerLocation: { lat: 34.0722, lng: -118.2637 },
    deliveryAddress: '456 Main Apt, Your City',
    estimatedDeliveryTime: '8:00 PM',
    orderPlacedTime: '7:20 PM'
  },
  {
    id: 'order789',
    items: [{ name: 'Book: "The Great Gatsby"', quantity: 1 }],
    restaurantName: 'Local Bookstore',
    dsp: { name: 'Sarah', vehicle: 'Van - VANLIFE1', location: { lat: 34.0400, lng: -118.2300 }, rating: 4.7 },
    eta: 0, // Not yet out for delivery, so ETA might be N/A or a general estimate
    status: 'Processing',
    customerLocation: { lat: 34.0822, lng: -118.2737 },
    deliveryAddress: '789 Oak Drive, Your City',
    estimatedDeliveryTime: 'Tomorrow 2:00 PM',
    orderPlacedTime: 'Today 10:00 AM'
  },
   {
    id: 'orderABC',
    items: [{ name: 'Groceries Bundle', quantity: 1 }],
    restaurantName: 'FreshMart',
    dsp: { name: 'Mike', vehicle: 'Car - SEDAN007', location: { lat: 34.0300, lng: -118.2200 }, rating: 4.6 },
    eta: 0,
    status: 'Confirmed & Rated',
    customerLocation: { lat: 34.0922, lng: -118.2837 },
    deliveryAddress: '101 Pine Ln, Your City',
    estimatedDeliveryTime: 'Yesterday 5:00 PM',
    orderPlacedTime: 'Yesterday 4:10 PM'
  }
];

// Icon component for order status
function OrderStatusIcon({ status, className = "w-6 h-6" }) {
  switch (status) {
    case 'Processing':
      return <Loader2 className={`${className} animate-spin text-blue-500`} />;
    case 'Out for Delivery':
      return <Truck className={`${className} text-emerald-500`} />;
    case 'Delivered':
      return <PackageCheck className={`${className} text-green-500`} />;
    case 'Confirmed Reception':
      return <CheckCircle className={`${className} text-green-600`} />;
    case 'Confirmed & Rated':
      return <CheckCircle2 className={`${className} text-purple-600`} />; // Using CheckCircle2 for distinction
    default:
      return <Package className={`${className} text-slate-500`} />;
  }
}

// ...existing code...

// Update the order display in ActiveOrdersListView
// ...existing imports and code...

// Update the order display in ActiveOrdersListView
function ActiveOrdersListView({ orders, onTrackOrder, onShowOrderDetails, onSimulateNewOrder }) {
  if (!orders || orders.length === 0) {
    // ...existing code...
  }

  return (
    <div className="flex-grow p-4 sm:p-6 bg-gray-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
      <header className="w-full max-w-3xl mx-auto mb-6 sm:mb-8">
        <div className="flex items-center text-emerald-600 dark:text-emerald-400">
          <ListOrdered size={32} className="mr-3"/>
          <h1 className="text-2xl sm:text-3xl font-bold">Your Active Orders</h1>
        </div>
         <button
            onClick={onSimulateNewOrder}
            className="mt-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow text-sm"
        >
            Add Test Order
        </button>
      </header>
      <ul className="space-y-4 max-w-3xl mx-auto">
        {orders.map(order => (
          <li key={order.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700/50 hover:shadow-xl transition-shadow duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex-grow mb-3 sm:mb-0">
                <div className="flex items-center mb-1">
                  <OrderStatusIcon status={order.status} className="w-7 h-7 mr-3 flex-shrink-0" />
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 truncate" title={order.restaurantName}>
                    {order.restaurantName}
                  </h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-10">Order ID: {order.id}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 ml-10 mt-1">
                  Status: <span className={`font-medium ${order.deliveryStustus === 'Out for Delivery' ? 'text-green-600' : 'text-blue-600'}`}>{order.status}</span>
                  {order.status === 'Out for Delivery' && order.eta > 0 && ` - ETA: ${order.eta} min`}
                </p>
                {/* --- UPDATED: Show more order info --- */}
                <div className="ml-10 mt-2 space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Placed:</span> {order.deliveryLocation?.lat || order.createdAt || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Estimated Delivery:</span> {order.estimatedDeliveryTime || order.eta ? `${order.eta} min` : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Delivery Address:</span> {order.deliveryAddress || 'N/A'}
                  </p>
                  {order.dsp && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Driver:</span> {order.dsp.name} ({order.dsp.vehicle})
                    </p>
                  )}
                  {order.items && order.items.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}>
                      <span className="font-semibold">Items:</span> {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                  )}
                </div>
              </div>
              <div className="w-full sm:w-auto flex-shrink-0">
                {/* Always show both buttons */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => onShowOrderDetails(order.id)}
                    className="w-full sm:w-auto flex items-center justify-center bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow hover:shadow-md transition-all duration-150 ease-in-out space-x-2 active:bg-blue-700"
                  >
                    <ListOrdered size={18} />
                    <span>Order Details</span>
                  </button>
                  <button
                    onClick={() => onTrackOrder(order.id)}
                    className="w-full sm:w-auto flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow hover:shadow-md transition-all duration-150 ease-in-out space-x-2 active:bg-emerald-700"
                  >
                    <MapPin size={18} />
                    <span>Track Order</span>
                  </button>
                </div>
                {order.status === 'Processing' && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-right pr-2">Preparing your order...</p>
                )}
                {order.status === 'Confirmed & Rated' && (
                  <div className="flex items-center justify-end text-purple-600 dark:text-purple-400">
                    <CheckCircle2 size={20} className="mr-2"/>
                    <span className="text-sm font-medium">Order Completed</span>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}



// ...rest of your code remains unchanged...
// ...existing code...

// Order Details Modal Component

// Main Application Component
// ...existing imports and code...
// Add this simple placeholder map component for demonstration.
// Replace with your real map implementation as needed.
function OrderMapView({ customerLocation, merchantLocation }) {
  return (
    <div className="w-11/12 h-80 md:h-[80%] bg-white dark:bg-gray-900 rounded-xl flex flex-col items-center justify-center shadow-inner border border-dashed border-emerald-400">
      <span className="text-emerald-600 dark:text-emerald-300 text-lg font-semibold mb-2">
        Map will be rendered here
      </span>
      <div className="text-xs text-gray-700 dark:text-gray-300">
        <div>
          <span className="font-semibold">Customer Location:</span>{" "}
          {customerLocation
            ? `${customerLocation.lat}, ${customerLocation.lng}`
            : "N/A"}
        </div>
        <div>
          <span className="font-semibold">Merchant Location:</span>{" "}
          {merchantLocation
            ? `${merchantLocation.lat}, ${merchantLocation.lng}`
            : "N/A"}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', or 'orderDetails'
  const [activeOrders, setActiveOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const leafletCSSId = 'leaflet-css';
    if (!document.getElementById(leafletCSSId)) {
      const link = document.createElement('link');
      link.id = leafletCSSId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    let customerId = localStorage.getItem('customerId');
    if (!customerId) {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userObj = JSON.parse(user);
          customerId = userObj?.customerId || userObj?._id || userObj?.id;
        } catch (e) {
          customerId = null;
        }
      }
    }
    const authToken = localStorage.getItem('authToken') || (JSON.parse(localStorage.getItem('user'))?.token);

    if (!customerId) {
      setError('No customer ID found. Please log in again.');
      setLoading(false);
      return;
    }
    if (!authToken) {
      setError('Authentication token is missing. Please log in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${API_BASE_URL}/customers/orders?customerId=${customerId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const orders = data.orders.map(order => ({
            ...order,
            id: order._id || order.id,
          }));
          setActiveOrders(orders);
          console.log("orders",orders)
        } else {
          setError(data.message || 'Failed to fetch orders');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Error fetching orders');
        setLoading(false);
      });
  }, []);

  const handleTrackOrder = (id) => {
    setSelectedOrderId(id);
    setViewMode('detail');
  };

  const handleShowOrderDetails = (id) => {
    setSelectedOrderId(id);
    setViewMode('orderDetails');
  };

  const handleBackToList = () => {
    setSelectedOrderId(null);
    setViewMode('list');
  };

  const selectedOrder = activeOrders.find(order => String(order.id) === String(selectedOrderId));
  console.log("selectedOrder: ", selectedOrder);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-lg text-emerald-600">Loading your orders...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-lg text-red-600">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 font-sans antialiased">
      {viewMode === 'list' ? (
        
        <ActiveOrdersListView
          orders={activeOrders}
          onTrackOrder={handleTrackOrder}
          onShowOrderDetails={handleShowOrderDetails}
          onSimulateNewOrder={() => {
            const newOrderId = `order${Date.now()}`;
            const newOrder = {
              id: newOrderId,
              items: [{ name: 'New Item', quantity: 1 }],
              restaurantName: 'The New Place',
              dsp: { name: 'Dave', vehicle: 'Drone - DRONE01', location: { lat: 34.0500, lng: -118.2400 }, rating: 0 },
              eta: 30,
              status: 'Processing',
              customerLocation: { lat: 34.0600, lng: -118.2500 },
              deliveryAddress: '789 New Ave, Your City',
              estimatedDeliveryTime: 'In 45 minutes',
              orderPlacedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setActiveOrders(prevOrders => [newOrder, ...prevOrders]);
          }}
        />
      ) : viewMode === 'detail' && selectedOrder ? (
        <div className="flex flex-1 h-screen">
          {/* Map placeholder */}
          <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-200 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700">
             <OrderMapView
              customerLocation={selectedOrder.customerLocation}
              merchantLocation={selectedOrder.dsp?.location}
            />
          </div>
          {/* Order details */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg animate-scaleUp">
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Order ID:</span> {selectedOrder.id}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Status:</span> {selectedOrder.status}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Placed:</span> {selectedOrder.orderPlacedTime || selectedOrder.createdAt || 'N/A'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Estimated Delivery:</span> {selectedOrder.estimatedDeliveryTime || selectedOrder.eta ? `${selectedOrder.eta} min` : 'N/A'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Delivery Address:</span> {selectedOrder.deliveryAddress || 'N/A'}
                </p>
                {selectedOrder.dsp && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Driver:</span> {selectedOrder.dsp.name} ({selectedOrder.dsp.vehicle})
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Items Ordered</h3>
                <ul className="space-y-3">
                  {selectedOrder.items.map(item => (
                    <li key={item.name} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                      <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                      <span className="text-gray-500 dark:text-gray-400">Quantity: {item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={handleBackToList}
                className="mt-6 p-2 bg-emerald-500 text-white rounded-md"
              >
                Go to Orders
              </button>
            </div>
          </div>
        </div>
      ) : viewMode === 'orderDetails' && selectedOrder ? (
        <div className="flex flex-col h-screen">
          <header className="bg-white dark:bg-gray-800 p-4 shadow-md flex items-center sticky top-0 z-20 border-b border-gray-200 dark:border-gray-700/50">
            <button onClick={handleBackToList} className="mr-3 p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <ArrowLeft size={22} />
            </button>
            
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">
              Order Details: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedOrder.restaurantName}</span>
            </h2>
          </header>
          
          <main className="flex-grow flex flex-col items-center justify-center p-6">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg animate-scaleUp">
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Order ID:</span> {selectedOrder.id}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Status:</span> {selectedOrder.status}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Placed:</span> {selectedOrder.orderPlacedTime || selectedOrder.createdAt || 'N/A'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Estimated Delivery:</span> {selectedOrder.estimatedDeliveryTime || selectedOrder.eta ? `${selectedOrder.eta} min` : 'N/A'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Delivery Address:</span> {selectedOrder?.deliveryLocation?.lat || 'N/A'}
                </p>
                {selectedOrder.dsp && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Driver:</span> {selectedOrder.dsp.name} ({selectedOrder.dsp.vehicle})
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Items Ordered</h3>
                <ul className="space-y-3">
                  {selectedOrder.items.map(item => (
                    <li key={item.name} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                      <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                      <span className="text-gray-500 dark:text-gray-400">Quantity: {item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </main>
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <h1 className="text-xl text-gray-700 dark:text-gray-300">Order not found or loading...</h1>
          <button onClick={handleBackToList} className="ml-4 p-2 bg-emerald-500 text-white rounded-md">Go to Orders</button>
        </div>
      )}
      <style jsx global>{`
        body {
          overscroll-behavior-y: contain;
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scaleUp { animation: scaleUp 0.3s ease-out forwards; }
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes scaleUp { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
        .dark .custom-scrollbar::-webkit-scrollbar-track { background: #1f2937; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
      `}</style>
    </div>
  );
}

export default App;
