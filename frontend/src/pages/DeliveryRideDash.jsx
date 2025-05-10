import React, { useState, useEffect } from 'react';
import { Bell, Bike, CheckCircle, XCircle, MapPin, Package, Clock, Navigation, Check, Phone, Store } from 'lucide-react';

// --- Mock Data ---
const initialNewOrders = [
  { id: 'order-5566', pickup: 'Gadget Hub', destination: '123 Main St', items: 2, distance: '3.5 km', etaMinutes: 8, assignedAt: Date.now() - 10000 },
  { id: 'order-5577', pickup: 'Fashion Forward', destination: '45 Elm Ave', items: 1, distance: '1.8 km', etaMinutes: 5, assignedAt: Date.now() - 30000 },
];

const initialActiveDeliveries = [
   // Example of an already accepted delivery
  // { id: 'order-5544', pickup: 'Book Nook', destination: '78 Oak Blvd', items: 3, distance: '5.1 km', etaMinutes: 12, status: 'Picked Up', acceptedAt: Date.now() - 600000 },
];

// --- Main App Component (for context) ---
export default function App() {
  // Rider dashboard would be behind authentication
  return <RiderDashboardPage riderId="rider-007" />;
}

// --- Rider Dashboard Page Component ---
function RiderDashboardPage({ riderId }) {
  const [newOrders, setNewOrders] = useState(initialNewOrders);
  const [activeDeliveries, setActiveDeliveries] = useState(initialActiveDeliveries);
  const [selectedDelivery, setSelectedDelivery] = useState(null); // Delivery being viewed in detail

  // Simulate new orders arriving periodically (replace with WebSocket/Push)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const randomId = `order-${Math.floor(10000 + Math.random() * 90000)}`;
      const newOrder = {
        id: randomId,
        pickup: `Merchant ${Math.floor(1 + Math.random() * 100)}`,
        destination: `${Math.floor(10 + Math.random() * 90)} Random St`,
        items: Math.floor(1 + Math.random() * 5),
        distance: `${(1 + Math.random() * 8).toFixed(1)} km`,
        etaMinutes: Math.floor(3 + Math.random() * 15),
        assignedAt: Date.now(),
      };
      // Add to front, limit total notifications shown
      setNewOrders(prev => [newOrder, ...prev.slice(0, 4)]);
    }, 30000); // New order every 30 seconds

    return () => clearInterval(intervalId); // Cleanup interval
  }, []);

  // --- Order Actions ---
  const handleAcceptOrder = (orderId) => {
    const orderToAccept = newOrders.find(order => order.id === orderId);
    if (orderToAccept) {
      setNewOrders(prev => prev.filter(order => order.id !== orderId));
      setActiveDeliveries(prev => [{ ...orderToAccept, status: 'Accepted', acceptedAt: Date.now() }, ...prev]);
      // Select the newly accepted delivery by default
      setSelectedDelivery({ ...orderToAccept, status: 'Accepted', acceptedAt: Date.now() });
      console.log(`Accepted order: ${orderId}`);
      // TODO: Send acceptance confirmation to backend
    }
  };

  const handleRejectOrder = (orderId) => {
    setNewOrders(prev => prev.filter(order => order.id !== orderId));
    console.log(`Rejected order: ${orderId}`);
    // TODO: Send rejection notification to backend
  };

  const handleSelectDelivery = (delivery) => {
    setSelectedDelivery(delivery);
  };

  // Placeholder for updating delivery status (e.g., Picked Up, Delivered)
   const handleUpdateStatus = (deliveryId, newStatus) => {
        setActiveDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, status: newStatus } : d));
        if (selectedDelivery && selectedDelivery.id === deliveryId) {
            setSelectedDelivery(prev => ({ ...prev, status: newStatus }));
        }
        console.log(`Updated status for ${deliveryId} to ${newStatus}`);
        // TODO: Send status update to backend
        if (newStatus === 'Delivered') {
            // Optionally clear selection or move to completed list after a delay
            setTimeout(() => {
                 setActiveDeliveries(prev => prev.filter(d => d.id !== deliveryId));
                 if (selectedDelivery && selectedDelivery.id === deliveryId) {
                    setSelectedDelivery(null);
                 }
            }, 2000);
        }
    };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-indigo-900 text-gray-200 font-sans flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar / List Area */}
      <aside className="w-full md:w-1/3 lg:w-1/4 h-screen flex flex-col border-r border-white/10 bg-black/10">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center space-x-3">
          <Bike className="w-6 h-6 text-indigo-400" />
          <h1 className="text-xl font-bold text-white">Rider Dashboard</h1>
        </div>

        {/* New Order Notifications */}
        <div className="p-4 space-y-3 overflow-y-auto flex-shrink-0 max-h-64 border-b border-white/10">
           <h2 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider flex items-center">
                <Bell className="w-4 h-4 mr-2 animate-pulse"/> New Orders ({newOrders.length})
           </h2>
          {newOrders.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">No new orders assigned.</p>
          ) : (
            newOrders.map(order => (
              <NotificationCard
                key={order.id}
                order={order}
                onAccept={handleAcceptOrder}
                onReject={handleRejectOrder}
              />
            ))
          )}
        </div>

        {/* Active Deliveries List */}
        <div className="flex-grow p-4 space-y-2 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Active Deliveries ({activeDeliveries.length})</h2>
          {activeDeliveries.length === 0 ? (
             <p className="text-xs text-gray-500 text-center py-4">No active deliveries.</p>
          ) : (
            activeDeliveries.map(delivery => (
              <ActiveDeliveryItem
                key={delivery.id}
                delivery={delivery}
                isSelected={selectedDelivery?.id === delivery.id}
                onSelect={handleSelectDelivery}
              />
            ))
          )}
        </div>
      </aside>

      {/* Main Content / Details Area */}
      <main className="flex-grow h-screen overflow-y-auto p-4 md:p-6 lg:p-8">
        {selectedDelivery ? (
          <DeliveryDetailsView
            delivery={selectedDelivery}
            onUpdateStatus={handleUpdateStatus}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
            <Package className="w-16 h-16 mb-4 opacity-30" />
            <h2 className="text-xl font-semibold text-gray-400">No Delivery Selected</h2>
            <p className="text-sm mt-1">Accept a new order or select an active delivery from the list.</p>
          </div>
        )}
      </main>
    </div>
  );
}

// --- Sub Components ---

// Notification Card for New Orders
function NotificationCard({ order, onAccept, onReject }) {
   const timeSinceAssigned = Math.round((Date.now() - order.assignedAt) / 60000); // Minutes ago

  return (
    <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-lg p-3 shadow-lg animate-fade-in-fast space-y-2 text-xs">
       <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-indigo-300">New Order: {order.id}</span>
            <span className="text-gray-400">{timeSinceAssigned} min ago</span>
       </div>
      <p className="text-gray-300"><span className="font-medium text-gray-400">From:</span> {order.pickup}</p>
      <p className="text-gray-300"><span className="font-medium text-gray-400">To:</span> {order.destination}</p>
      <div className="flex justify-between items-center text-gray-400 pt-1">
        <span>Items: {order.items}</span>
        <span>~{order.distance}</span>
        <span>ETA: {order.etaMinutes} min</span>
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <button
          onClick={() => onReject(order.id)}
          className="px-3 py-1 text-xs font-medium text-red-300 bg-red-900/40 rounded hover:bg-red-800/60 transition duration-150"
        >
          <XCircle className="w-3 h-3 inline mr-1"/> Reject
        </button>
        <button
          onClick={() => onAccept(order.id)}
          className="px-3 py-1 text-xs font-medium text-green-300 bg-green-900/40 rounded hover:bg-green-800/60 transition duration-150"
        >
          <CheckCircle className="w-3 h-3 inline mr-1"/> Accept
        </button>
      </div>
       {/* CSS for fade-in animation */}
      <style jsx global>{`
        @keyframes fadeInFast { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-fast { animation: fadeInFast 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}

// List Item for Active Deliveries
function ActiveDeliveryItem({ delivery, isSelected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(delivery)}
      className={`w-full text-left p-3 rounded-lg border transition duration-150 ease-in-out ${
        isSelected ? 'bg-indigo-800/50 border-indigo-500 shadow-md' : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-700/40'
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-300'}`}>{delivery.id}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
            delivery.status === 'Accepted' ? 'bg-blue-500/20 text-blue-300' :
            delivery.status === 'Picked Up' ? 'bg-yellow-500/20 text-yellow-300' :
            delivery.status === 'En Route' ? 'bg-purple-500/20 text-purple-300' :
            'bg-gray-500/20 text-gray-400' // Default/Other
        }`}>{delivery.status}</span>
      </div>
      <p className="text-xs text-gray-400 truncate">To: {delivery.destination}</p>
    </button>
  );
}

// Details View for Selected Delivery
function DeliveryDetailsView({ delivery, onUpdateStatus }) {

  // Determine next action based on status
  const getNextAction = () => {
    switch (delivery.status) {
        case 'Accepted': return { label: 'Mark as Picked Up', status: 'Picked Up', icon: Package };
        case 'Picked Up': return { label: 'Start Delivery (En Route)', status: 'En Route', icon: Navigation };
        case 'En Route': return { label: 'Mark as Delivered', status: 'Delivered', icon: Check };
        default: return null;
    }
  };

  const nextAction = getNextAction();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Delivery Details: {delivery.id}</h2>
        <p className="text-sm text-indigo-300">{delivery.status}</p>
      </div>

      {/* Map Simulation Placeholder */}
      <div className="bg-gray-800/50 border border-indigo-500/20 rounded-lg p-4 h-64 flex items-center justify-center text-gray-500 flex-col">
         <MapPin className="w-12 h-12 mb-2 opacity-50"/>
         <p className="text-sm">Map / Navigation Placeholder</p>
         <p className="text-xs mt-1">(Integrate map library here)</p>
         {/* Could show simplified route line */}
         <div className="flex items-center space-x-4 mt-4 text-xs">
            <div className="flex items-center text-green-400"><Store className="w-4 h-4 mr-1"/> Pickup: {delivery.pickup}</div>
            <div className="text-gray-500">→</div>
            <div className="flex items-center text-blue-400"><MapPin className="w-4 h-4 mr-1"/> Dest: {delivery.destination}</div>
         </div>
      </div>

      {/* Delivery Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <InfoItem icon={Store} label="Pickup From" value={delivery.pickup} />
          <InfoItem icon={MapPin} label="Deliver To" value={delivery.destination} />
          <InfoItem icon={Package} label="Items" value={delivery.items.toString()} />
          <InfoItem icon={Clock} label="Est. Time" value={`${delivery.etaMinutes} min`} />
          <InfoItem icon={Navigation} label="Distance" value={delivery.distance} />
           {/* Add Contact Customer Button Placeholder */}
           <div className="md:col-span-2">
                 <button className="w-full mt-2 flex items-center justify-center px-4 py-2 bg-teal-600/80 text-white text-sm font-medium rounded-md hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-150 ease-in-out">
                    <Phone className="w-4 h-4 mr-2" /> Contact Customer (Placeholder)
                 </button>
           </div>
      </div>

      {/* Action Button */}
      {nextAction && (
           <button
            onClick={() => onUpdateStatus(delivery.id, nextAction.status)}
            className="w-full mt-6 flex items-center justify-center px-6 py-3 bg-indigo-600 text-white text-base font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-150 ease-in-out shadow-lg"
            >
                <nextAction.icon className="w-5 h-5 mr-2" />
                {nextAction.label}
            </button>
      )}

      {/* CSS for fade-in animation */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}

// Helper component for displaying info items
function InfoItem({ icon: Icon, label, value }) {
    return (
        <div className="bg-white/5 p-3 rounded-md border border-white/10">
            <div className="flex items-center text-xs text-gray-400 mb-1">
                <Icon className="w-3 h-3 mr-1.5" />
                {label}
            </div>
            <p className="text-sm text-white font-medium truncate">{value}</p>
        </div>
    );
}

