import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Bell, MessageSquare, User, CheckCircle, XCircle, Navigation, Send, Package, LogOut, Settings, AlertTriangle, ListChecks, Truck, Clock, Home, ArrowLeft, Briefcase, CreditCard, Shield, Edit3, Save, ToggleLeft, ToggleRight, EyeOff, Eye, LocateFixed, ChevronsRight, X, DollarSign, TrendingUp } from 'lucide-react';

// Mock Data - Replace with API calls
const initialNotificationsData = [
  { id: 'n1', pickup: 'Restaurant A, 123 Main St', dropoff: 'Customer X, 456 Oak Ave', distance: '2.5 km', pay: '$8.50', items: '2 Pizzas, 1 Soda', time: 'ASAP' },
  { id: 'n2', pickup: 'Grocery Store B, 789 Pine Rd', dropoff: 'Customer Y, 101 Maple Dr', distance: '3.1 km', pay: '$10.20', items: 'Assorted Groceries', time: 'Within 1 hour' },
];

const customerChats = {
  'd1': [
    { id: 'm1', sender: 'customer', text: 'Hey, can you leave the package at the front door?', time: '10:30 AM' },
    { id: 'm2', sender: 'driver', text: 'Sure, will do!', time: '10:31 AM' },
  ],
  'd2': [
    { id: 'm3', sender: 'customer', text: 'Are you close?', time: '11:05 AM' },
  ]
};

// Helper function to get current time
const getCurrentTime = (includeDate = false) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (includeDate) {
        const dateString = now.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
        return `${dateString}, ${timeString}`; // e.g., "May 12, 2025, 04:16 PM"
    }
    return timeString; // e.g., "04:16 PM"
};

// Helper function to get the start and end of the current week (Monday to Sunday)
const getWeekDateRange = (date = new Date()) => {
    const currentDay = date.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay; // Adjust if Sunday
    
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { startOfWeek: monday, endOfWeek: sunday };
};


// Main Application Component
function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [notifications, setNotifications] = useState([]); 
  const [allFetchedNotifications, setAllFetchedNotifications] = useState(initialNotificationsData); 
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [mapDestination, setMapDestination] = useState(null); 

  const [driverProfile, setDriverProfile] = useState({
    name: "John Doe", // Placeholder for dspguyname
    vehicleId: "PLATE-XYZ123",
    accountCreatedDate: "Jan 15, 2023", 
    vehicleDetails: {
      make: "Generic Motors",
      model: "DeliverPro 500",
      year: "2022",
      type: "Van", 
    }
  });
  const [earningsHistory, setEarningsHistory] = useState([
    { id: 'e0', items: 'Sample Past Delivery 1', dropoff: 'Old Client Address 1', amount: 12.75, date: 'May 05, 2025, 02:30 PM' },
    { id: 'e1', items: 'Sample Past Delivery 2', dropoff: 'Old Client Address 2', amount: 20.50, date: 'May 06, 2025, 10:00 AM' },
    { id: 'e2', items: 'Sample Past Delivery 3', dropoff: 'Old Client Address 3', amount: 8.00, date: 'May 01, 2025, 05:00 PM' },
    { id: 'e3', items: 'Sample Past Delivery 4', dropoff: 'Old Client Address 4', amount: 15.25, date: getCurrentTime(true) },
  ]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // --- Effects for managing notifications ---
  useEffect(() => {
    const timer = setTimeout(() => {
      if (allFetchedNotifications.length < 10) { 
        const newNotificationPayload = { 
          id: `n${allFetchedNotifications.length + Date.now().toString().slice(-3)}`, 
          pickup: `New Pickup Spot ${allFetchedNotifications.length + 1}`, 
          dropoff: `Customer Z-${allFetchedNotifications.length + 1}`, 
          distance: `${(Math.random() * 5 + 1).toFixed(1)} km`, 
          pay: `$${(Math.random() * 10 + 5).toFixed(2)}`, 
          items: `Assorted Items #${allFetchedNotifications.length + 1}`, 
          time: Math.random() > 0.5 ? 'Urgent' : 'Flexible' 
        };
        setAllFetchedNotifications(prev => [...prev, newNotificationPayload]);
        if (notificationsEnabled) {
          setNotifications(prev => {
            const isAlreadyVisible = prev.some(n => n.id === newNotificationPayload.id);
            const isActiveDelivery = activeDelivery && (activeDelivery.originalId === newNotificationPayload.id || activeDelivery.id === newNotificationPayload.id);
            if (!isAlreadyVisible && !isActiveDelivery) {
              return [...prev, newNotificationPayload];
            }
            return prev;
          });
        }
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [allFetchedNotifications, notificationsEnabled, activeDelivery]);

  useEffect(() => {
    if (notificationsEnabled) {
        const currentNotificationIds = new Set(notifications.map(n => n.id));
        const activeDeliveryOriginalId = activeDelivery ? activeDelivery.originalId : null;
        const newNotificationsToShow = allFetchedNotifications.filter(
            n => !currentNotificationIds.has(n.id) && n.id !== activeDeliveryOriginalId
        );
        if (newNotificationsToShow.length > 0) {
             setNotifications(prev => 
                [...prev, ...newNotificationsToShow]
                .filter((notif, index, self) => index === self.findIndex((t) => t.id === notif.id)) 
                .filter(n => n.id !== activeDeliveryOriginalId) 
            );
        }
    }
  }, [notificationsEnabled, allFetchedNotifications, activeDelivery, notifications]);

  // --- Delivery Handlers ---
  const handleAcceptDelivery = (notification) => {
    setActiveDelivery({
      ...notification, originalId: notification.id, id: `d${Date.now()}`, 
      status: 'Accepted - En route to pickup', customerId: `cust_${notification.id.slice(-3)}`,
      pickupTime: null, deliveryTime: null,
    });
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
    setCurrentView('dashboard');
    setMapDestination(notification.pickup); 
  };

  const handleRejectDelivery = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setAllFetchedNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleUpdateStatus = (newStatus) => {
    if (!activeDelivery) return;
    let updatedDelivery = { ...activeDelivery, status: newStatus };
    if (newStatus === 'Picked Up - En route to customer') {
      updatedDelivery.pickupTime = getCurrentTime(); // Only time for pickup
      setMapDestination(activeDelivery.dropoff); 
    }
    setActiveDelivery(updatedDelivery);
  };

  const handleConfirmDelivery = () => {
    if (!activeDelivery) return;
    const fullDeliveryTime = getCurrentTime(true); 
    const newEarning = {
      id: `e${Date.now()}`, items: activeDelivery.items, dropoff: activeDelivery.dropoff,
      amount: parseFloat(activeDelivery.pay.replace('$', '')), date: fullDeliveryTime, 
    };
    setEarningsHistory(prev => [newEarning, ...prev]); 
    setActiveDelivery(prev => ({ ...prev, status: 'Delivered', deliveryTime: fullDeliveryTime })); 
    if (activeDelivery.originalId) {
        setAllFetchedNotifications(prev => prev.filter(n => n.id !== activeDelivery.originalId));
    }
    setTimeout(() => {
      setActiveDelivery(null); setMapDestination(null); setCurrentView('dashboard');
    }, 3000);
  };
  
  // --- Profile Handlers ---
  const updateVehicleDetails = (newDetails) => {
    setDriverProfile(prev => ({ ...prev, vehicleDetails: { ...prev.vehicleDetails, ...newDetails } }));
    console.log("Vehicle details updated:", newDetails);
  };

  const updateDriverName = (newName) => {
    setDriverProfile(prev => ({ ...prev, name: newName }));
    console.log("Driver name updated to:", newName);
  };

  // --- Navigation Handlers ---
  const handleNavigate = () => {
    if (activeDelivery) {
      const destinationAddress = activeDelivery.status.includes('pickup') ? activeDelivery.pickup : activeDelivery.dropoff;
      setMapDestination(destinationAddress);
      setCurrentView('map');
    } else {
      setMapDestination(null); 
      setCurrentView('map');
    }
  };

  const handleOpenChat = () => {
    if (activeDelivery && activeDelivery.customerId) {
      setChatMessages(customerChats[activeDelivery.originalId] || []); 
      setCurrentView('chat');
    } else { 
      setChatMessages([{id: 'support1', sender: 'system', text: 'How can we help you today?', time: getCurrentTime()}]);
      setCurrentView('chat');
    }
  };

  // --- Chat Handler ---
  const handleSendChatMessage = () => {
    const trimmedInput = chatInput.trim();
    if (trimmedInput === '') return;
    const newMessage = { id: `m${Date.now()}`, sender: 'driver', text: trimmedInput, time: getCurrentTime() };
    setChatMessages(prev => [...prev, newMessage]);
    if (activeDelivery && customerChats[activeDelivery.originalId]) {
        customerChats[activeDelivery.originalId].push(newMessage);
    } else if (!activeDelivery) {
        console.log("Message to support:", newMessage); 
    }
    setChatInput('');
  };

  // --- View Rendering Logic ---
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView {...{ notifications, activeDelivery, handleAcceptDelivery, handleRejectDelivery, handleUpdateStatus, handleConfirmDelivery, handleNavigate, handleOpenChat, notificationsEnabled, allFetchedNotifications, setActiveDelivery, setNotificationsEnabled }} />;
      case 'map':
        return <MapView textualDestination={mapDestination} onBack={() => setCurrentView('dashboard')} />;
      case 'chat':
        return <ChatView {...{ messages: chatMessages, chatInput, onChatInputChange: setChatInput, onSendMessage: handleSendChatMessage, onBack: () => setCurrentView('dashboard'), contactName: activeDelivery ? `Customer: ${activeDelivery.dropoff.split(',')[0]}` : "Support" }} />;
      case 'profile':
        return <ProfileView {...{ driverProfile, earningsHistory, notificationsEnabled, onSetNotificationsEnabled: setNotificationsEnabled, onUpdateVehicleDetails: updateVehicleDetails, onUpdateDriverName: updateDriverName, activeDelivery, onLogout: () => { console.log("Logout clicked!"); setCurrentView('dashboard'); setActiveDelivery(null); } }} />;
      default: 
        return <DashboardView {...{ notifications, activeDelivery, handleAcceptDelivery, handleRejectDelivery, notificationsEnabled, allFetchedNotifications }} />;
    }
  };
  
  // --- Navigation Items Configuration ---
  const navItems = [
    { view: 'dashboard', label: 'Dashboard', icon: Home },
    { view: 'map', label: 'Map', icon: MapPin },
    { view: 'chat', label: 'Chat', icon: MessageSquare },
    { view: 'profile', label: 'Profile', icon: User },
  ];

  // --- Header Title Logic ---
  const currentNavItemForTitle = navItems.find(nav => nav.view === currentView);
  let headerTitleText = "DSP App"; // Fallback
  if (currentNavItemForTitle) {
      if (currentNavItemForTitle.view === 'dashboard') {
          headerTitleText = driverProfile.name ? `${driverProfile.name}'s Dashboard` : "Driver Dashboard";
      } else {
          headerTitleText = currentNavItemForTitle.label; 
      }
  }

  // --- Main App Structure ---
  return (
    // Add 'dark' class here manually or via state for dark mode toggle
    <div className="flex h-screen bg-slate-100 dark:bg-gray-950 font-sans text-slate-900 dark:text-gray-200">
      
      {/* Sidebar Navigation - Fixed width, non-expanding, boxed icons */}
      <nav className="w-20 bg-white dark:bg-gray-900 p-3 shadow-lg flex flex-col items-center space-y-3 fixed top-0 left-0 h-full z-20 border-r border-slate-200 dark:border-gray-700">
        {/* Sidebar Header - Icon only */}
        <div className="flex items-center justify-center mb-4 h-12 shrink-0">
          <Truck size={32} className="text-blue-600 dark:text-blue-500 transition-colors duration-300" />
        </div>

        {/* Navigation Links - Boxed Icons */}
        {navItems.map(item => (
          <button
            key={item.view}
            onClick={() => {
              if (item.view === 'map') handleNavigate(); 
              else if (item.view === 'chat') handleOpenChat();
              else setCurrentView(item.view);
            }}
            title={item.label} // Tooltip for accessibility
            className={`flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-95
                        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-opacity-70
                        ${currentView === item.view 
                            ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-gray-100' // Active state
                            : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-gray-200' // Default & hover
                        }`} 
          >
            <item.icon 
              size={24} 
              strokeWidth={currentView === item.view ? 2.5 : 2} 
              className="transition-colors duration-300" // Color is inherited
            />
            {/* Label removed from visual display */}
          </button>
        ))}
      </nav>

      {/* Main Content Area - Fixed left margin */}
      <div className="flex-1 flex flex-col ml-20"> {/* Removed transition classes */}
        <header className="bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 p-4 shadow-md flex justify-between items-center sticky top-0 z-10 border-b border-slate-200 dark:border-gray-700">
            <h1 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                {headerTitleText}
            </h1>
            {activeDelivery && (
            <div className="text-sm text-slate-600 dark:text-gray-400 hidden md:block">
                <span className="font-medium text-blue-600 dark:text-blue-400">Active:</span> {activeDelivery.items} to {activeDelivery.dropoff.split(',')[0]}
            </div>
            )}
            {/* Profile button in header */}
            <button 
              onClick={() => setCurrentView('profile')} 
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-400"
              title="View Profile"
            >
                <User size={24} />
            </button>
        </header>
        
        {/* Render the active view */}
        <main className="flex-grow p-3 md:p-6 overflow-y-auto"> {/* Background is handled by the main div */}
            {renderView()}
        </main>
      </div>
    </div>
  );
}

// --- Child Components (Dashboard, Cards, Map, Chat, Profile) ---

// Dashboard View Component
function DashboardView({ notifications, activeDelivery, handleAcceptDelivery, handleRejectDelivery, handleUpdateStatus, handleConfirmDelivery, handleNavigate, handleOpenChat, notificationsEnabled, allFetchedNotifications, setActiveDelivery, setNotificationsEnabled }) {
  // Calculate derived state inside the component
  const hasMoreNotifications = allFetchedNotifications.filter(n => !notifications.find(vn => vn.id === n.id) && (!activeDelivery || n.id !== activeDelivery.originalId)).length > 0 && !activeDelivery;

  return (
    <div className="space-y-5">
      {/* Notifications Disabled Warning */}
      {!notificationsEnabled && hasMoreNotifications && (
        <div className="bg-amber-100 dark:bg-amber-900/50 border-l-4 border-amber-500 dark:border-amber-400 text-amber-700 dark:text-amber-300 p-4 rounded-lg shadow-md mb-5" role="alert">
          <div className="flex items-center">
            <AlertTriangle size={24} className="mr-3 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-200">Notifications Disabled</p>
              <p className="text-sm">You have new delivery opportunities! Turn on notifications to see them.</p>
            </div>
          </div>
          <button
            onClick={() => setNotificationsEnabled(true)}
            className="mt-3 w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2 shadow hover:shadow-md"
          >
            <Bell size={18} />
            <span>Turn On Notifications</span>
          </button>
        </div>
      )}

      {/* Active Delivery Card or Placeholder */}
      {activeDelivery ? (
        <ActiveDeliveryCard
          delivery={activeDelivery}
          onUpdateStatus={handleUpdateStatus}
          onConfirmDelivery={handleConfirmDelivery}
          onNavigate={handleNavigate}
          onChat={handleOpenChat}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center border border-slate-200 dark:border-gray-700">
          <Package size={52} className="mx-auto text-slate-400 dark:text-gray-500 mb-4" />
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-gray-300 mb-1">No Active Delivery</h2>
          <p className="text-slate-500 dark:text-gray-400">Waiting for your next assignment. Stay tuned!</p>
        </div>
      )}

      {/* Incoming Deliveries Section */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-200">Incoming Deliveries</h2>
          <div className="relative">
            <Bell size={28} className="text-blue-500 dark:text-blue-400" />
            {notificationsEnabled && notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </div>
        </div>
        {/* Display Notifications or Placeholders */}
        {notificationsEnabled && notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map(notif => (
              <NotificationCard key={notif.id} notification={notif} onAccept={handleAcceptDelivery} onReject={handleRejectDelivery} />
            ))}
          </div>
        ) : (
          !activeDelivery && notificationsEnabled && notifications.length === 0 && (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center border border-slate-200 dark:border-gray-700">
              <Bell size={52} className="mx-auto text-slate-400 dark:text-gray-500 mb-4" />
              <p className="text-slate-500 dark:text-gray-400">No new delivery requests. Great job!</p>
            </div>
          )
        )}
         {!notificationsEnabled && !hasMoreNotifications && !activeDelivery && (
             <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center border border-slate-200 dark:border-gray-700">
                <EyeOff size={52} className="mx-auto text-slate-400 dark:text-gray-500 mb-4" />
                <p className="text-slate-600 dark:text-gray-300 font-semibold">Notifications are currently off.</p>
                <p className="text-slate-500 dark:text-gray-400 text-sm">Turn them on in settings to see requests.</p>
             </div>
         )}
      </div>
    </div>
  );
}

// Notification Card Component
function NotificationCard({ notification, onAccept, onReject }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="mb-3 sm:mb-0">
          <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-1">{notification.items}</h3>
          <p className="text-sm text-slate-600 dark:text-gray-400"><MapPin size={14} className="inline mr-1 text-slate-400 dark:text-gray-500" /> <span className="font-medium text-slate-700 dark:text-gray-300">Pickup:</span> {notification.pickup}</p>
          <p className="text-sm text-slate-600 dark:text-gray-400"><MapPin size={14} className="inline mr-1 text-slate-400 dark:text-gray-500" /> <span className="font-medium text-slate-700 dark:text-gray-300">Dropoff:</span> {notification.dropoff}</p>
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto">
          <p className="text-xl font-bold text-green-600 dark:text-green-400">{notification.pay}</p>
          <p className="text-xs text-slate-500 dark:text-gray-500">{notification.distance}</p>
        </div>
      </div>
      {notification.time && (
        <div className="mt-3 text-xs text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-3 py-1.5 rounded-lg inline-flex items-center border border-amber-200 dark:border-amber-700">
          <AlertTriangle size={16} className="mr-1.5 text-amber-600 dark:text-amber-400" />
          <span className="font-medium">{notification.time}</span>
        </div>
      )}
      {/* Action Buttons - Green/Red */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-600 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
        <button
          onClick={() => onAccept(notification)}
          className="flex-1 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow hover:shadow-md transition-all duration-200 ease-in-out flex items-center justify-center space-x-2 transform hover:scale-105"
        >
          <CheckCircle size={20} />
          <span>Accept</span>
        </button>
        <button
          onClick={() => onReject(notification.id)}
          className="flex-1 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow hover:shadow-md transition-all duration-200 ease-in-out flex items-center justify-center space-x-2 transform hover:scale-105"
        >
          <XCircle size={20} />
          <span>Reject</span>
        </button>
      </div>
    </div>
  );
}

// Active Delivery Card Component
function ActiveDeliveryCard({ delivery, onUpdateStatus, onConfirmDelivery, onNavigate, onChat }) {
  const getStatusPillStyle = (status) => { 
    if (status.includes('Delivered')) return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700';
    if (status.includes('Picked Up')) return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700';
    if (status.includes('Accepted')) return 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700';
    return 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-gray-600';
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-gray-800/80 p-5 rounded-xl shadow-xl border border-slate-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2 sm:mb-0">Active Delivery</h2>
        <span className={`px-4 py-1.5 text-sm font-semibold rounded-full border ${getStatusPillStyle(delivery.status)} shadow-sm`}>
          {delivery.status}
        </span>
      </div>
      <div className="mb-4 space-y-2 bg-slate-50/70 dark:bg-gray-700/50 p-4 rounded-lg shadow-inner border border-slate-200 dark:border-gray-600">
        <p className="text-md text-slate-700 dark:text-gray-300"><strong className="text-slate-500 dark:text-gray-400">Items:</strong> {delivery.items}</p>
        <div className="flex items-center text-md text-slate-700 dark:text-gray-300">
          <MapPin size={16} className="mr-2 text-blue-500 dark:text-blue-400 flex-shrink-0"/> 
          <div><strong className="text-slate-500 dark:text-gray-400">Pickup:</strong> {delivery.pickup} 
            {delivery.pickupTime && <span className="text-xs text-green-600 dark:text-green-400 font-medium ml-1 bg-green-100 dark:bg-green-900/50 px-1.5 py-0.5 rounded">(Picked up: {delivery.pickupTime})</span>}
          </div>
        </div>
        <div className="flex items-center text-md text-slate-700 dark:text-gray-300">
          <MapPin size={16} className="mr-2 text-red-500 dark:text-red-400 flex-shrink-0"/>
          <div><strong className="text-slate-500 dark:text-gray-400">Dropoff:</strong> {delivery.dropoff}</div>
        </div>
        {delivery.deliveryTime && <p className="text-md text-green-600 dark:text-green-400 font-semibold flex items-center"><CheckCircle size={18} className="mr-1.5"/>Delivered at: {delivery.deliveryTime}</p>}
      </div>
      {/* Action Buttons - Blue/Gray */}
      {delivery.status !== 'Delivered' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button onClick={onNavigate} className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow hover:shadow-md transition-all flex items-center justify-center space-x-2 transform hover:scale-105">
            <Navigation size={20} /> <span>Navigate</span>
          </button>
          <button onClick={onChat} className="bg-slate-600 hover:bg-slate-700 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg shadow hover:shadow-md transition-all flex items-center justify-center space-x-2 transform hover:scale-105">
            <MessageSquare size={20} /> <span>Chat Customer</span>
          </button>
        </div>
      )}
      {/* Status Update/Confirm Buttons - Blue/Green */}
      {delivery.status === 'Accepted - En route to pickup' && (
        <button onClick={() => onUpdateStatus('Picked Up - En route to customer')} className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow hover:shadow-md transition-all mb-2 flex items-center justify-center space-x-2 transform hover:scale-105">
          <Package size={20} /> <span>Confirm Pickup</span>
        </button>
      )}
      {delivery.status === 'Picked Up - En route to customer' && (
        <button onClick={onConfirmDelivery} className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow hover:shadow-md transition-all mb-2 flex items-center justify-center space-x-2 transform hover:scale-105">
          <CheckCircle size={20} /> <span>Confirm Delivery</span>
        </button>
      )}
      {delivery.status === 'Delivered' && (
         <div className="text-center text-green-600 dark:text-green-400 font-semibold p-4 bg-green-50 dark:bg-green-900/50 rounded-lg border border-green-200 dark:border-green-700 shadow-sm">
           <CheckCircle size={24} className="inline mr-2 text-green-500 dark:text-green-400"/> Delivery Completed Successfully!
         </div>
      )}
    </div>
  );
}

// Map View Component 
// (Assuming Leaflet handles its own theming, no major changes needed here unless specific map controls need dark mode styling)
function MapView({ textualDestination, onBack }) {
  const mapContainerRef = useRef(null); 
  const mapInstanceRef = useRef(null); 
  const userMarkerRef = useRef(null); 
  
  const [currentPosition, setCurrentPosition] = useState(null);
  const [mapLoadingMessage, setMapLoadingMessage] = useState('Initializing map...');
  const [isCentered, setIsCentered] = useState(true); 

  useEffect(() => {
    if (!window.L) {
      setMapLoadingMessage('Leaflet library not found. Please ensure it is included in your HTML.');
      console.error("Leaflet (L) not found.");
      return;
    }
    const L = window.L;

    if (mapContainerRef.current && !mapInstanceRef.current) {
      try {
        setMapLoadingMessage('Loading map tiles...');
        const map = L.map(mapContainerRef.current).setView([0, 0], 2);
        
        // Consider adding dark mode tile layer option if needed
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);
        
        mapInstanceRef.current = map;
        setMapLoadingMessage(''); 

        map.on('dragstart', () => setIsCentered(false)); 
        map.on('zoomstart', () => setIsCentered(false));

        if (navigator.geolocation) {
          setMapLoadingMessage('Attempting to get your initial location...');
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const initialPos = [latitude, longitude];
              setCurrentPosition(initialPos);
              if (mapInstanceRef.current) { 
                mapInstanceRef.current.setView(initialPos, 15);
                if (userMarkerRef.current) {
                    userMarkerRef.current.setLatLng(initialPos);
                } else {
                    const defaultIcon = L.icon({ 
                        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                    });
                    userMarkerRef.current = L.marker(initialPos, { icon: defaultIcon, title: 'userLocation' })
                                        .addTo(mapInstanceRef.current)
                                        .bindPopup("You are here! (Initial)").openPopup();
                }
                setIsCentered(true); 
              }
              setMapLoadingMessage('');
            },
            (error) => {
              console.error("Initial Geolocation Error:", error);
              setMapLoadingMessage(`Initial Location Error: ${error.message}. Displaying default map.`);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 } 
          );
        } else {
          setMapLoadingMessage("Geolocation not supported. Displaying default map.");
        }

      } catch (error) {
        console.error("Error initializing map:", error);
        setMapLoadingMessage("Failed to initialize map. Please check console.");
      }
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        userMarkerRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect for watching user position
  useEffect(() => {
    if (!mapInstanceRef.current || !navigator.geolocation || !window.L) {
        return;
    }
    const L = window.L;
    let watcherId;

    watcherId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPos = [latitude, longitude];
        setCurrentPosition(newPos); 
        setMapLoadingMessage(''); 

        if (mapInstanceRef.current) {
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(newPos);
          } else {
            // Create marker if it doesn't exist
            const defaultIcon = L.icon({ 
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
            });
            userMarkerRef.current = L.marker(newPos, { icon: defaultIcon, title: 'userLocation' })
              .addTo(mapInstanceRef.current)
              .bindPopup("You are here!");
          }
          // Center map only if user hasn't manually panned/zoomed
          if (isCentered) {
            mapInstanceRef.current.setView(newPos, mapInstanceRef.current.getZoom() < 13 ? 15 : mapInstanceRef.current.getZoom());
          }
        }
      },
      (error) => {
        console.error("Watch Position Error:", error);
        if (!mapLoadingMessage.includes("Error")) { 
            setMapLoadingMessage(`Location Tracking Error: ${error.message}.`);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Options for watchPosition
    );

    // Cleanup function for watchPosition
    return () => {
      if (watcherId) navigator.geolocation.clearWatch(watcherId);
    };
  }, [isCentered, mapLoadingMessage]); // Re-run if isCentered changes

  // Function to handle recentering the map
  const handleRecenter = () => {
    if (mapInstanceRef.current && currentPosition) {
      mapInstanceRef.current.setView(currentPosition, 15);
      setIsCentered(true); // Re-enable auto-centering
      setMapLoadingMessage('');
    } else if (mapInstanceRef.current) {
      // If current position is unknown, try to get it again
      setMapLoadingMessage('Finding your location to recenter...');
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const { latitude, longitude } = position.coords;
              const newPos = [latitude, longitude];
              setCurrentPosition(newPos); 
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setView(newPos, 15);
              }
              setIsCentered(true);
              setMapLoadingMessage('');
          },
          (error) => {
              setMapLoadingMessage(`Error recentering: ${error.message}`);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-xl h-full flex flex-col border border-slate-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 dark:border-gray-600">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-gray-200">Navigation View</h2>
        <button onClick={onBack} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium px-3 py-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft size={18} className="inline mr-1" /> Back to Dashboard
        </button>
      </div>
      
      {/* Map Container */}
      <div ref={mapContainerRef} id="leaflet-map-container" className="flex-grow rounded-lg min-h-[300px] sm:min-h-[400px] md:min-h-[500px] bg-slate-200 dark:bg-gray-600 relative">
        {/* Loading/Error Message Overlay */}
        {mapLoadingMessage && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200/70 dark:bg-gray-800/70 z-10 backdrop-blur-sm">
            <p className="text-slate-600 dark:text-gray-300 text-lg p-6 bg-white/90 dark:bg-gray-900/90 rounded-xl shadow-2xl border border-slate-300 dark:border-gray-700">{mapLoadingMessage}</p>
          </div>
        )}
      </div>
      
      {/* Bottom Controls */}
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        {/* Destination Display */}
        {textualDestination ? (
            <div className="p-3 bg-slate-100 dark:bg-gray-700 rounded-lg text-sm text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-600">
                <strong>Destination:</strong> {textualDestination}
            </div>
        ) : (
             <div className="p-3 bg-slate-100 dark:bg-gray-700 rounded-lg text-sm text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-gray-600">
                <strong>No active navigation destination.</strong>
            </div>
        )}
        {/* Recenter Button */}
        <button 
            onClick={handleRecenter}
            className="p-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
            title="Recenter on my location"
        >
            <LocateFixed size={20} />
        </button>
      </div>

      {/* Current Location Display */}
      {!mapLoadingMessage.toLowerCase().includes("error") && currentPosition && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 rounded-lg text-xs">
          Current Location: Lat: {currentPosition[0].toFixed(4)}, Lng: {currentPosition[1].toFixed(4)}
        </div>
      )}
    </div>
  );
}


// Chat View Component
function ChatView({ messages, chatInput, onChatInputChange, onSendMessage, onBack, contactName }) {
  const messagesEndRef = React.useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl h-full flex flex-col border border-slate-200 dark:border-gray-700 max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-220px)]">
      {/* Chat Header */}
      <header className="p-4 border-b border-slate-200 dark:border-gray-600 flex justify-between items-center bg-slate-50 dark:bg-gray-700 rounded-t-xl">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-gray-200">{contactName || "Chat"}</h2>
        <button onClick={onBack} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium px-3 py-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors">
            <ArrowLeft size={18} className="inline mr-1" /> Back
        </button>
      </header>
      {/* Message Area */}
      <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-slate-100 dark:bg-gray-900">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'driver' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] sm:max-w-[60%] px-4 py-2.5 rounded-xl shadow-sm 
              ${msg.sender === 'driver' 
                ? 'bg-blue-500 dark:bg-blue-600 text-white rounded-br-none' 
                : 'bg-slate-200 dark:bg-gray-600 text-slate-800 dark:text-gray-200 rounded-bl-none border border-slate-300 dark:border-gray-500'
              }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p className={`text-xs mt-1.5 ${msg.sender === 'driver' ? 'text-blue-100 dark:text-blue-200' : 'text-slate-500 dark:text-gray-400'} text-right`}>{msg.time}</p>
            </div>
          </div>
        ))}
        {messages.length === 0 && <p className="text-slate-500 dark:text-gray-400 text-center py-10">No messages yet.</p>}
        <div ref={messagesEndRef} /> {/* Anchor for scrolling */}
      </div>
      {/* Input Area */}
      <div className="p-3 border-t border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-b-xl">
        <div className="flex items-center space-x-2">
          <input 
            type="text" 
            value={chatInput} 
            onChange={(e) => onChatInputChange(e.target.value)} 
            placeholder="Type your message..."
            className="flex-grow p-3 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-shadow focus:shadow-md" 
            onKeyDown={(e) => { if (e.key === 'Enter') onSendMessage(); }} // Send on Enter key
          />
          <button 
            onClick={onSendMessage} 
            disabled={!chatInput.trim()}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white p-3 rounded-lg shadow hover:shadow-md transition-all disabled:bg-slate-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Profile Sub-View Components ---

// Wrapper for sub-views within Profile/Settings
const SubViewWrapper = ({ title, onBack, children, className = "" }) => (
  <div className={`bg-white dark:bg-gray-800 p-5 md:p-8 rounded-xl shadow-xl border border-slate-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out ${className}`}>
    <button
      onClick={onBack}
      className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-6 p-2 rounded-md hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors group"
    >
      <ArrowLeft size={20} className="mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform duration-200" />
      Back to Profile Settings
    </button>
    <h2 className="text-3xl font-bold text-slate-800 dark:text-gray-200 mb-6 pb-3 border-b border-slate-300 dark:border-gray-600">{title}</h2>
    {children}
  </div>
);

// Displays basic account info
const AccountInfoDisplay = ({ profile }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-3 border-b border-blue-200 dark:border-blue-700 pb-2">Account Information</h3>
    <div>
      <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider">Driver Name</p>
      <p className="text-lg font-medium text-slate-700 dark:text-gray-300">{profile.name}</p>
    </div>
    <div>
      <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider">Account Created</p>
      <p className="text-lg font-medium text-slate-700 dark:text-gray-300">{profile.accountCreatedDate}</p>
    </div>
    <div>
      <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider">Registered Vehicle ID</p>
      <p className="text-lg font-medium text-slate-700 dark:text-gray-300">{profile.vehicleId}</p>
    </div>
  </div>
);

// Displays and allows editing of vehicle details
const VehicleDetailsDisplay = ({ vehicleDetails, onUpdateVehicleDetails }) => {
  const [currentType, setCurrentType] = useState(vehicleDetails.type);
  const [isEditing, setIsEditing] = useState(false);
  const vehicleTypes = ["Car", "Motorcycle", "Bicycle", "Van", "Truck (Light)"];

  const handleSave = () => {
    onUpdateVehicleDetails({ type: currentType });
    setIsEditing(false);
  };
  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-3 border-b border-blue-200 dark:border-blue-700 pb-2">Vehicle Details</h3>
      {/* Display Make, Model, Year */}
      <div>
        <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider">Make</p>
        <p className="text-lg font-medium text-slate-700 dark:text-gray-300">{vehicleDetails.make}</p>
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider">Model</p>
        <p className="text-lg font-medium text-slate-700 dark:text-gray-300">{vehicleDetails.model}</p>
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider">Year</p>
        <p className="text-lg font-medium text-slate-700 dark:text-gray-300">{vehicleDetails.year}</p>
      </div>
      {/* Edit Vehicle Type */}
      <div>
        <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider">Vehicle Type</p>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center">
                <Edit3 size={12} className="mr-1" /> Edit
              </button>
            )}
        </div>
        {isEditing ? (
            <div className="flex items-center space-x-2">
                <select 
                  value={currentType} 
                  onChange={(e) => setCurrentType(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-gray-700 border border-blue-400 dark:border-gray-600 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-700 dark:text-gray-200 text-sm"
                >
                  {vehicleTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                {/* Save/Cancel Edit Buttons */}
                <button onClick={handleSave} className="p-2.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md shadow text-sm"><Save size={16}/></button>
                <button onClick={() => setIsEditing(false)} className="p-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-slate-700 dark:text-gray-200 rounded-md shadow text-sm"><X size={16}/></button>
            </div>
          ) : (
            <p className="text-lg font-medium text-slate-700 dark:text-gray-300">{currentType}</p>
          )}
      </div>
    </div>
  );
};

// Displays earnings summary and recent history
const EarningsHistoryDisplay = ({ earnings }) => {
  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);
  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-3 border-b border-blue-200 dark:border-blue-700 pb-2">Earnings Summary</h3>
      {/* Total Earnings Display */}
      <div className="mb-4 p-4 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white rounded-lg shadow-md">
        <p className="text-sm uppercase tracking-wider">Total Earnings</p>
        <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
      </div>
      {/* Recent Earnings List or Placeholder */}
      {earnings.length === 0 ? (
        <div className="text-center py-6 bg-slate-50 dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-gray-600">
            <CreditCard size={36} className="mx-auto text-slate-400 dark:text-gray-500 mb-2" />
            <p className="text-slate-500 dark:text-gray-400 text-sm">No earnings recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {earnings.slice(0, 5).map(earning => ( 
            <div key={earning.id} className="p-3 bg-slate-50 dark:bg-gray-700 rounded-md border border-slate-200 dark:border-gray-600 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm text-slate-700 dark:text-gray-300">{earning.items}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">To: {earning.dropoff.split(',')[0]}</p>
                </div>
                <p className="text-md font-semibold text-green-600 dark:text-green-400">${earning.amount.toFixed(2)}</p>
              </div>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5 text-right">{earning.date}</p>
            </div>
          ))}
           {earnings.length > 5 && <p className="text-xs text-blue-600 dark:text-blue-400 text-center mt-2">View all in settings...</p>}
        </div>
      )}
    </div>
  );
};

// App Settings Sub-View
function AppSettingsView({ onBack, driverName, onUpdateDriverName, earningsHistory }) {
  const [editableName, setEditableName] = useState(driverName);
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);
  const weeklyGoal = 500; 

  useEffect(() => { setEditableName(driverName); }, [driverName]);

  useEffect(() => {
    const { startOfWeek, endOfWeek } = getWeekDateRange();
    const currentWeekEarnings = earningsHistory
      .filter(earning => { const earningDate = new Date(earning.date); return earningDate >= startOfWeek && earningDate <= endOfWeek; })
      .reduce((sum, earning) => sum + earning.amount, 0);
    setWeeklyEarnings(currentWeekEarnings);
  }, [earningsHistory]);

  const handleNameSave = (e) => {
    e.preventDefault();
    if (editableName.trim() === "") { console.error("Name cannot be empty."); return; }
    onUpdateDriverName(editableName.trim());
    console.log("Profile name updated!"); 
  };

  const earningsPercentage = weeklyGoal > 0 ? (weeklyEarnings / weeklyGoal) * 100 : 0;

  return (
    <SubViewWrapper title="App Settings" onBack={onBack}>
      {/* Update Profile Name Section */}
      <div className="mb-8 p-5 bg-slate-50 dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-gray-600 shadow-sm">
        <h4 className="text-lg font-semibold text-slate-700 dark:text-gray-200 mb-3">Update Profile Name</h4>
        <form onSubmit={handleNameSave} className="space-y-3">
          <div>
            <label htmlFor="driverName" className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-1">
              Driver Name
            </label>
            <input
              type="text" id="driverName" value={editableName} onChange={(e) => setEditableName(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-700 dark:text-gray-100"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold rounded-md shadow hover:shadow-md transition-colors flex items-center space-x-2">
            <Save size={18} /> <span>Save Name</span>
          </button>
        </form>
      </div>

      {/* Weekly Earnings Progress Section */}
      <div className="p-5 bg-slate-50 dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-gray-600 shadow-sm">
        <h4 className="text-lg font-semibold text-slate-700 dark:text-gray-200 mb-1">Weekly Earnings Progress</h4>
        <p className="text-xs text-slate-500 dark:text-gray-400 mb-3">Your earnings from Monday to Sunday.</p>
        <div className="flex justify-between items-center text-sm font-medium text-slate-600 dark:text-gray-300 mb-1">
          <span>Earned: <span className="text-green-600 dark:text-green-400 font-bold">${weeklyEarnings.toFixed(2)}</span></span>
          <span>Goal: <span className="text-slate-500 dark:text-gray-400">${weeklyGoal.toFixed(2)}</span></span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-gray-600 rounded-full h-6 overflow-hidden border border-slate-300 dark:border-gray-500">
          <div
            className="bg-gradient-to-r from-blue-400 to-green-500 dark:from-blue-500 dark:to-green-600 h-full rounded-full transition-all duration-500 ease-out flex items-center justify-center text-xs font-medium text-white"
            style={{ width: `${Math.min(earningsPercentage, 100)}%` }}
            title={`$${weeklyEarnings.toFixed(2)} / $${weeklyGoal.toFixed(2)}`}
          >
           {earningsPercentage > 10 && `${Math.min(earningsPercentage, 100).toFixed(0)}%`} 
          </div>
        </div>
        {weeklyEarnings >= weeklyGoal && (
            <p className="text-center text-sm text-green-600 dark:text-green-400 font-semibold mt-2 flex items-center justify-center">
                <TrendingUp size={18} className="mr-1"/> Goal Reached!
            </p>
        )}
      </div>
    </SubViewWrapper>
  );
}

// Notification Preferences Sub-View
function NotificationPrefsView({ onBack, enabled, onSetEnabled }) {
  return (
    <SubViewWrapper title="Notification Preferences" onBack={onBack}>
      <div className="p-5 bg-slate-50 dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-gray-600 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-200">Delivery Notifications</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400">Receive alerts for new delivery opportunities.</p>
          </div>
          {/* Toggle Button */}
          <button 
            onClick={() => onSetEnabled(!enabled)}
            className={`p-1 rounded-full transition-colors duration-300 ${enabled ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700' : 'bg-slate-300 hover:bg-slate-400 dark:bg-gray-600 dark:hover:bg-gray-500'}`}
            aria-pressed={enabled}
          >
            {enabled ? <ToggleRight size={32} className="text-white" /> : <ToggleLeft size={32} className="text-slate-600 dark:text-gray-400" />}
          </button>
        </div>
        <p className={`mt-3 text-sm font-medium ${enabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          Notifications are currently <span className="font-bold">{enabled ? 'ON' : 'OFF'}</span>.
        </p>
      </div>
    </SubViewWrapper>
  );
}

// Privacy & Security Sub-View
function PrivacySecurityView({ onBack }) {
    return (
      <SubViewWrapper title="Privacy & Security" onBack={onBack}>
        <div className="space-y-4">
            <p className="text-slate-600 dark:text-gray-400">Manage your account's privacy settings and security options.</p>
            {/* Placeholder sections */}
            <div className="p-4 bg-slate-50 dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-gray-600">
                <h4 className="font-semibold text-slate-700 dark:text-gray-200">Password Management</h4>
                <p className="text-sm text-slate-500 dark:text-gray-400">Use a strong, unique password.</p>
                <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">Change Password (Not Implemented)</button>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-gray-600">
                <h4 className="font-semibold text-slate-700 dark:text-gray-200">Two-Factor Authentication (2FA)</h4>
                <p className="text-sm text-slate-500 dark:text-gray-400">Add extra security to your account.</p>
                <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">Setup 2FA (Not Implemented)</button>
            </div>
        </div>
      </SubViewWrapper>
    );
}

// Main Profile View Component
function ProfileView({ driverProfile, earningsHistory, notificationsEnabled, onSetNotificationsEnabled, onUpdateVehicleDetails, onUpdateDriverName, activeDelivery, onLogout }) {
  const [activeSubView, setActiveSubView] = useState(null);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);

  // Settings options configuration
  const settingsOptions = [
    { id: 'appSettings', label: "App Settings", icon: Settings, component: (props) => <AppSettingsView {...props} driverName={driverProfile.name} onUpdateDriverName={onUpdateDriverName} earningsHistory={earningsHistory} /> },
    { id: 'notificationPrefs', label: "Notification Preferences", icon: Bell, component: (props) => <NotificationPrefsView {...props} enabled={notificationsEnabled} onSetEnabled={onSetNotificationsEnabled} /> },
    { id: 'privacySecurity', label: "Privacy & Security", icon: Shield, component: (props) => <PrivacySecurityView {...props} /> },
  ];

  // Render sub-view if active
  if (activeSubView) {
    const selectedOption = settingsOptions.find(opt => opt.id === activeSubView);
    if (selectedOption?.component) {
      // Pass onBack handler to the sub-view component
      return selectedOption.component({ onBack: () => { setActiveSubView(null); setShowSettingsPopup(false); } });
    }
  }

  // Calculate deliveries today
  const todayDateString = new Date().toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  const deliveriesTodayCount = earningsHistory.filter(e => e.date.startsWith(todayDateString)).length;

  return (
    // Main profile container
    <div className="bg-transparent p-0 md:p-0 rounded-xl space-y-8 relative"> {/* Adjusted padding/bg for profile */}
      {/* Settings Button & Popup */}
      <div className="absolute top-0 right-0 z-30"> {/* Adjusted positioning */}
        <button 
            onClick={() => setShowSettingsPopup(!showSettingsPopup)}
            className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
            title="Settings"
        >
            <Settings size={24} />
        </button>
        {/* Settings Popup Menu */}
        {showSettingsPopup && (
            <div 
                className="absolute top-14 right-0 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-slate-200 dark:border-gray-700 p-4 space-y-2
                           transform transition-all duration-300 ease-out 
                           opacity-0 animate-fadeInScaleUp"
                style={{ animationFillMode: 'forwards' }} // Ensure final state persists
            >
                {/* Close Button */}
                <button onClick={() => setShowSettingsPopup(false)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300"> <X size={18}/> </button>
                <h4 className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">Settings Panel</h4>
                {/* Map through settings options */}
                {settingsOptions.map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => setActiveSubView(opt.id)} // Set active sub-view on click
                        className="w-full flex items-center space-x-3 p-3 text-left text-slate-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-400 rounded-md transition-colors duration-150 group"
                    >
                        <opt.icon size={20} className="text-slate-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0" />
                        <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                ))}
            </div>
        )}
      </div>
      
      {/* Profile Header Section */}
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-300 dark:border-gray-600">
        {/* Profile Avatar */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-blue-500 to-green-500 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg ring-4 ring-white dark:ring-gray-800">
          {driverProfile.name.substring(0,1)}
        </div>
        {/* Profile Name & ID */}
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-gray-200 text-center sm:text-left">{driverProfile.name}</h2>
          <p className="text-slate-600 dark:text-gray-400 text-center sm:text-left">Vehicle ID: <span className="font-medium text-slate-700 dark:text-gray-300">{driverProfile.vehicleId}</span></p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Deliveries Today", value: deliveriesTodayCount + (activeDelivery && activeDelivery.status !== 'Delivered' ? 1 : 0) , color: "blue", icon: ListChecks },
          { label: "Total Earnings", value: `$${earningsHistory.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}`, color: "green", icon: Package },
          { label: "Average Rating", value: `4.8 ★`, color: "amber", icon: CheckCircle }, 
        ].map(item => (
          <div key={item.label} className={`bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg text-center border border-slate-200 dark:border-gray-700 hover:shadow-xl transition-shadow transform hover:-translate-y-1 duration-200`}>
            <item.icon size={32} className={`mx-auto mb-2 text-${item.color}-600 dark:text-${item.color}-400`} />
            <p className={`text-3xl font-bold text-${item.color}-600 dark:text-${item.color}-400`}>{item.value}</p>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{item.label}</p>
          </div>
        ))}
      </div>
      
      {/* Main Profile Details Section */}
      <div className="mt-8 max-w-2xl mx-auto p-6 md:p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl 
                      ring-1 ring-blue-400/60 dark:ring-blue-600/60 shadow-blue-400/20 dark:shadow-blue-900/30">
        <AccountInfoDisplay profile={driverProfile} />
        <VehicleDetailsDisplay vehicleDetails={driverProfile.vehicleDetails} onUpdateVehicleDetails={onUpdateVehicleDetails} />
        <EarningsHistoryDisplay earnings={earningsHistory} />
      </div>
      
      {/* Logout Button */}
      <div className="pt-4 text-center">
        <button 
          onClick={onLogout}
          className="w-full max-w-xs mx-auto flex items-center justify-center space-x-3 p-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900/80 rounded-lg transition-all duration-200 group border border-red-300 dark:border-red-700 hover:border-red-400 dark:hover:border-red-600 shadow hover:shadow-md"
        >
          <LogOut size={20} className="text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors" />
          <span className="text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 font-medium">Logout</span>
        </button>
      </div>
      {/* Global Styles (Animation, Scrollbar) */}
      <style jsx global>{`
        .animate-fadeInScaleUp { animation: fadeInScaleUp 0.3s ease-out forwards; }
        @keyframes fadeInScaleUp { 
          0% { opacity: 0; transform: scale(0.95) translateY(-10px); } 
          100% { opacity: 1; transform: scale(1) translateY(0); } 
        }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; /* light */ background: #1f2937; /* dark */ border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; /* light */ background: #4b5563; /* dark */ border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; /* light */ background: #6b7280; /* dark */ }
        /* Basic dark mode scrollbar for the whole page */
        html.dark ::-webkit-scrollbar { width: 8px; }
        html.dark ::-webkit-scrollbar-track { background: #1f2937; } /* gray-800 */
        html.dark ::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 10px; } /* gray-600 */
        html.dark ::-webkit-scrollbar-thumb:hover { background: #6b7280; } /* gray-500 */
      `}</style>
    </div>
  );
}

export default App;
