import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, MessageSquare, Star, AlertCircle, Send, LocateFixed, User, ShoppingBag, Clock, X, ThumbsUp, ThumbsDown, ChevronDown, ArrowLeft, CheckCircle } from 'lucide-react';

// Mock Data - Replace with API calls in a real application
const initialOrderData = {
  id: 'order123',
  items: [
    { name: 'Large Pepperoni Pizza', quantity: 1 },
    { name: 'Coke (2L)', quantity: 1 },
  ],
  restaurantName: 'Luigi\'s Pizzeria',
  dsp: {
    name: 'Marco',
    vehicle: 'Scooter - PLATE789',
    location: { lat: 34.0522, lng: -118.2437 },
    rating: 4.8,
  },
  eta: 25,
  status: 'Out for Delivery', // Initial status
  customerLocation: { lat: 34.0622, lng: -118.2537 },
  deliveryAddress: '123 Customer St, Your City',
};

// Helper function to get current time
const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Main Application Component
function App() {
  const [currentOrder, setCurrentOrder] = useState(initialOrderData);
  const [view, setView] = useState('tracking');
  const [chatMessages, setChatMessages] = useState([
    { id: 'cm1', sender: 'dsp', text: 'Hi there! I\'m on my way with your order from Luigi\'s Pizzeria.', time: '06:30 PM' },
    { id: 'cm2', sender: 'customer', text: 'Great, thanks for the update!', time: '06:31 PM' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Effect to load Leaflet CSS
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

  // Simulate DSP movement and ETA updates
  useEffect(() => {
    if (currentOrder && currentOrder.status === 'Out for Delivery') {
      const etaInterval = setInterval(() => {
        setCurrentOrder(prevOrder => {
          if (!prevOrder || prevOrder.eta <= 1) {
            clearInterval(etaInterval);
            return { ...prevOrder, eta: 0, status: 'Delivered' };
          }
          return { ...prevOrder, eta: prevOrder.eta - 1 };
        });
      }, 60000);

      const dspMoveInterval = setInterval(() => {
        setCurrentOrder(prevOrder => {
          if (!prevOrder || prevOrder.status !== 'Out for Delivery') {
            clearInterval(dspMoveInterval);
            return prevOrder;
          }
          const targetLat = prevOrder.customerLocation.lat;
          const targetLng = prevOrder.customerLocation.lng;
          const currentLat = prevOrder.dsp.location.lat;
          const currentLng = prevOrder.dsp.location.lng;
          const latDiff = targetLat - currentLat;
          const lngDiff = targetLng - currentLng;
          const newLat = currentLat + latDiff * 0.1 + (Math.random() - 0.5) * 0.0005;
          const newLng = currentLng + lngDiff * 0.1 + (Math.random() - 0.5) * 0.0005;

          return {
            ...prevOrder,
            dsp: { ...prevOrder.dsp, location: { lat: newLat, lng: newLng } }
          };
        });
      }, 5000);

      return () => {
        clearInterval(etaInterval);
        clearInterval(dspMoveInterval);
      };
    }
  }, [currentOrder?.status]);

  // Automatically show rating modal when order is delivered
  useEffect(() => {
    if (currentOrder && currentOrder.status === 'Delivered' && !showRatingModal) {
      const timer = setTimeout(() => {
        setShowRatingModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentOrder?.status, showRatingModal]);

  const handleSendChatMessage = () => {
    if (chatInput.trim() === '') return;
    const newMessage = { id: `cm${Date.now()}`, sender: 'customer', text: chatInput, time: getCurrentTime() };
    setChatMessages(prev => [...prev, newMessage]);
    setTimeout(() => {
        setChatMessages(prev => [...prev, {id: `dsp${Date.now()}`, sender: 'dsp', text: "Okay, noted!", time: getCurrentTime()}]);
    }, 1500);
    setChatInput('');
  };

  const handleRatingSubmit = (rating, feedback) => {
    console.log('Rating Submitted:', { orderId: currentOrder.id, dsp: currentOrder.dsp.name, rating, feedback });
    alert(`Thank you for your ${rating}-star rating for ${currentOrder.dsp.name}!`);
    setShowRatingModal(false);
  };

  const handleReportSubmit = (reportDetails) => {
    console.log('Report Submitted:', { orderId: currentOrder.id, ...reportDetails });
    alert(`Your report for order ${currentOrder.id} regarding "${reportDetails.issueType}" has been submitted.`);
    setShowReportModal(false);
  };

  if (!currentOrder) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100 text-slate-700">
        <div className="text-center p-10 bg-white rounded-xl shadow-2xl">
          <ShoppingBag size={64} className="mx-auto text-emerald-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">No Active Order</h1>
          <p className="text-slate-500">You don't have any active orders right now.</p>
          <button
            onClick={() => setCurrentOrder(initialOrderData)}
            className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:shadow-md transition-all"
          >
            Simulate New Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-gray-900 font-sans antialiased">
      <header className="bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 p-4 shadow-md flex justify-between items-center sticky top-0 z-20 border-b border-slate-200 dark:border-gray-700">
        <div className="flex items-center">
          <ShoppingBag size={28} className="mr-3 text-emerald-500 dark:text-emerald-400"/>
          <h1 className="text-xl font-semibold">Your Order from <span className="text-emerald-600 dark:text-emerald-400 font-bold">{currentOrder.restaurantName}</span></h1>
        </div>
        <div className="text-sm text-slate-600 dark:text-gray-400">
            Order ID: <span className="font-medium">{currentOrder.id}</span>
        </div>
      </header>

      <main className="flex-grow p-0 md:p-0 overflow-hidden relative">
        {view === 'tracking' && (
          <OrderTrackingView
            order={currentOrder}
            onOpenChat={() => setView('chat')}
            onOpenReport={() => setShowReportModal(true)}
            onRateOrder={() => setShowRatingModal(true)}
          />
        )}
        {view === 'chat' && (
          <CustomerChatView
            messages={chatMessages}
            chatInput={chatInput}
            onChatInputChange={setChatInput}
            onSendMessage={handleSendChatMessage}
            onBack={() => setView('tracking')}
            dspName={currentOrder.dsp.name}
          />
        )}
      </main>

      {showRatingModal && (
        <RatingModal
            dspName={currentOrder.dsp.name}
            onSubmit={handleRatingSubmit}
            onClose={() => setShowRatingModal(false)}
        />
      )}
      {showReportModal && (
        <ReportIssueModal
            orderId={currentOrder.id}
            onSubmit={handleReportSubmit}
            onClose={() => setShowReportModal(false)}
        />
      )}
      <style jsx global>{`
        body {
          overscroll-behavior-y: contain;
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scaleUp { animation: scaleUp 0.3s ease-out forwards; }
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes scaleUp { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}

// Order Tracking View
function OrderTrackingView({ order, onOpenChat, onOpenReport, onRateOrder }) {
  let statusDisplay;
  let statusColorClass = "text-slate-800 dark:text-gray-200";

  switch (order.status) {
    case 'Processing':
      statusDisplay = "Order Processing";
      statusColorClass = "text-emerald-600 dark:text-emerald-400";
      break;
    case 'Out for Delivery':
      statusDisplay = "Out for Delivery";
      statusColorClass = "text-emerald-600 dark:text-emerald-400 animate-pulse";
      break;
    case 'Delivered':
      statusDisplay = "Delivered!";
      statusColorClass = "text-green-600 dark:text-green-400";
      break;
    case 'Cancelled':
      statusDisplay = "Order Cancelled";
      statusColorClass = "text-red-600 dark:text-red-400";
      break;
    default:
      statusDisplay = order.status;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow relative min-h-[200px] md:min-h-[300px]">
        <CustomerMapView
          customerLocation={order.customerLocation}
          dspLocation={order.dsp.location}
          destinationAddress={order.deliveryAddress}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 shadow-top-lg border-t border-slate-200 dark:border-gray-700 rounded-t-2xl z-10">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className={`text-2xl font-bold ${statusColorClass}`}>{statusDisplay}</h2>
            {order.status === 'Out for Delivery' && order.eta > 0 && (
              <p className="text-emerald-700 dark:text-emerald-400 font-semibold text-lg flex items-center mt-1">
                <Clock size={20} className="mr-2 flex-shrink-0"/> ETA: {order.eta} min
              </p>
            )}
            {order.status === 'Delivered' && (
                <p className="text-green-700 dark:text-green-400 font-semibold text-lg flex items-center mt-1">
                    <CheckCircle size={20} className="mr-2 flex-shrink-0 text-green-500 dark:text-green-400"/> Enjoy your meal!
                </p>
            )}
          </div>
          <div className="text-right flex-shrink-0 ml-2">
              <p className="text-sm text-slate-500 dark:text-gray-400">Driver</p>
              <p className="font-semibold text-slate-700 dark:text-gray-300">{order.dsp.name}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">{order.dsp.vehicle}</p>
          </div>
        </div>

        <div className="mb-4">
            <h4 className="font-semibold text-slate-700 dark:text-gray-300 mb-1">Items:</h4>
            <ul className="text-sm text-slate-600 dark:text-gray-400 list-disc list-inside pl-1 max-h-20 overflow-y-auto custom-scrollbar">
                {order.items.map(item => (
                    <li key={item.name} className="truncate">{item.quantity}x {item.name}</li>
                ))}
            </ul>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={onOpenChat}
            className="flex items-center justify-center w-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg shadow hover:shadow-md transition-all duration-150 ease-in-out space-x-2 active:bg-emerald-700"
          >
            <MessageSquare size={20}/>
            <span>Chat</span>
          </button>
          <button
            onClick={onOpenReport}
            className="flex items-center justify-center w-full bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-lg shadow hover:shadow-md transition-all duration-150 ease-in-out space-x-2 active:bg-slate-400 dark:active:bg-gray-500"
          >
            <AlertCircle size={20}/>
            <span>Report Issue</span>
          </button>
        </div>
        {order.status === 'Delivered' && (
             <button
                onClick={onRateOrder}
                className="w-full flex items-center justify-center bg-amber-400 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg shadow hover:shadow-md transition-all duration-150 ease-in-out space-x-2 active:bg-amber-600 dark:active:bg-amber-700"
            >
                <Star size={20}/>
                <span>Rate Delivery</span>
            </button>
        )}
      </div>
    </div>
  );
}

// Customer Map View Component (Leaflet Integration)
function CustomerMapView({ customerLocation, dspLocation, destinationAddress }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const dspMarkerRef = useRef(null);

  const [mapLoadingMessage, setMapLoadingMessage] = useState('Initializing map...');
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  useEffect(() => {
    if (typeof window.L === 'undefined') {
      setMapLoadingMessage('Map library (Leaflet) not loaded yet. Please wait...');
      return;
    }
    const L = window.L;

    if (mapContainerRef.current && !mapInstanceRef.current) {
      try {
        setMapLoadingMessage('Loading map...');
        const map = L.map(mapContainerRef.current, {
            zoomControl: false
        }).setView([customerLocation.lat, customerLocation.lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          minZoom: 5,
        }).addTo(map);

        L.control.zoom({ position: 'topright' }).addTo(map);

        mapInstanceRef.current = map;
        setMapLoadingMessage('');

        map.on('dragstart', () => setIsUserInteracting(true));
        map.on('zoomstart', () => setIsUserInteracting(true));

        // Customer Icon (Home) - Using a distinct but harmonious color
        const customerIcon = L.divIcon({
            html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="%2334d399"><path d="M12 2c-4.418 0-8 3.582-8 8 0 4.418 8 12 8 12s8-7.582 8-12c0-4.418-3.582-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/><circle cx="12" cy="10" r="2.5" fill="white"/></svg>`,
            className: 'custom-map-icon',
            iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -32],
        });
        customerMarkerRef.current = L.marker([customerLocation.lat, customerLocation.lng], { icon: customerIcon, zIndexOffset: 1000, title: 'Your Location' })
          .addTo(map)
          .bindPopup(`<b>Your Address:</b><br>${destinationAddress}`);

        // DSP Icon (Delivery Vehicle) - Already emerald
        const dspIcon = L.divIcon({
            html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="%2310b981"><path d="M19.586 3.414a2 2 0 00-2.828 0L12 8.172 7.242 3.414a2 2 0 00-2.828 2.828L8.172 12l-4.758 4.758a2 2 0 002.828 2.828L12 15.828l4.758 4.758a2 2 0 002.828-2.828zM12 13a1 1 0 110-2 1 1 0 010 2z" transform="rotate(45 12 12) scale(0.8)"/><path d="M18.364 5.636A9 9 0 005.636 18.364 9 9 0 0018.364 5.636zM12 20a8 8 0 110-16 8 8 0 010 16z" fill-opacity="0.3"/><circle cx="12" cy="12" r="2" fill="white"/></svg>`,
            className: 'custom-map-icon',
            iconSize: [40, 40], iconAnchor: [20, 20], popupAnchor: [0, -30],
        });
        dspMarkerRef.current = L.marker([dspLocation.lat, dspLocation.lng], { icon: dspIcon, title: 'Delivery Driver' })
          .addTo(map)
          .bindPopup("Your Driver");

      } catch (error) {
        console.error("Error initializing map:", error);
        setMapLoadingMessage("Failed to initialize map. Please ensure you are connected to the internet.");
      }
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [customerLocation.lat, customerLocation.lng]);

  useEffect(() => {
    if (mapInstanceRef.current && dspMarkerRef.current && dspLocation) {
      const newLatLng = L.latLng(dspLocation.lat, dspLocation.lng);
      dspMarkerRef.current.setLatLng(newLatLng);

      if (!isUserInteracting) {
        if (customerMarkerRef.current) {
            const bounds = L.latLngBounds(customerMarkerRef.current.getLatLng(), newLatLng);
            mapInstanceRef.current.fitBounds(bounds.pad(0.3), { animate: true, duration: 0.5, maxZoom: 16 });
        }
      }
    }
  }, [dspLocation, isUserInteracting]);

  useEffect(() => {
    if (customerMarkerRef.current && customerLocation) {
        customerMarkerRef.current.setLatLng([customerLocation.lat, customerLocation.lng]);
    }
  }, [customerLocation]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && customerMarkerRef.current && dspMarkerRef.current) {
      const bounds = L.latLngBounds(customerMarkerRef.current.getLatLng(), dspMarkerRef.current.getLatLng());
      mapInstanceRef.current.fitBounds(bounds.pad(0.3), { animate: true, duration: 0.5, maxZoom: 16 });
      setIsUserInteracting(false);
    } else if (mapInstanceRef.current && customerLocation) {
        mapInstanceRef.current.setView([customerLocation.lat, customerLocation.lng], 15, { animate: true, duration: 0.5 });
        setIsUserInteracting(false);
    }
  };

  return (
    <div className="h-full w-full relative">
      <div ref={mapContainerRef} className="h-full w-full bg-slate-200 dark:bg-gray-700">
        {mapLoadingMessage && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 dark:bg-gray-800/80 z-20 backdrop-blur-sm">
            <div className="text-center p-4">
                <svg className="animate-spin h-8 w-8 text-emerald-500 dark:text-emerald-400 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-slate-600 dark:text-gray-300 text-base">{mapLoadingMessage}</p>
            </div>
          </div>
        )}
      </div>
      <button
        onClick={handleRecenter}
        className="absolute top-4 right-14 z-10 p-2.5 bg-white dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-300 rounded-lg shadow-md transition-all"
        title="Recenter map"
        aria-label="Recenter map"
      >
        <LocateFixed size={20} />
      </button>
      <style jsx global>{`
        .custom-map-icon .leaflet-marker-icon {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
        }
        .leaflet-popup-content-wrapper {
            border-radius: 8px !important;
        }
        .leaflet-popup-content {
            margin: 10px !important;
            font-size: 0.875rem !important;
        }
      `}</style>
    </div>
  );
}

// Customer Chat View
function CustomerChatView({ messages, chatInput, onChatInputChange, onSendMessage, onBack, dspName }) {
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl h-full flex flex-col border border-slate-200 dark:border-gray-700 overflow-hidden">
      <header className="p-3 sm:p-4 border-b border-slate-200 dark:border-gray-700 flex justify-between items-center bg-slate-50 dark:bg-gray-700 rounded-t-xl flex-shrink-0">
        <button onClick={onBack} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium px-2 py-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-gray-600 transition-colors flex items-center group">
            <ArrowLeft size={20} className="inline group-hover:-translate-x-0.5 transition-transform duration-150" />
            <span className="ml-1 hidden sm:inline">Back</span>
        </button>
        <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-gray-200 text-center truncate px-2">Chat with {dspName}</h2>
        <div className="w-16 sm:w-20"> </div>
      </header>
      <div className="flex-grow p-3 sm:p-4 space-y-4 overflow-y-auto bg-slate-100 dark:bg-gray-900 custom-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] sm:max-w-[70%] px-3.5 py-2.5 rounded-xl shadow-sm ${msg.sender === 'customer' ? 'bg-emerald-500 dark:bg-emerald-600 text-white rounded-br-none' : 'bg-slate-200 dark:bg-gray-600 text-slate-800 dark:text-gray-200 rounded-bl-none border border-slate-300 dark:border-gray-500'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
              <p className={`text-xs mt-1.5 ${msg.sender === 'customer' ? 'text-emerald-100 dark:text-emerald-200' : 'text-slate-500 dark:text-gray-400'} text-right`}>{msg.time}</p>
            </div>
          </div>
        ))}
        {messages.length === 0 && <p className="text-slate-500 dark:text-gray-400 text-center py-10">No messages yet. Say hello!</p>}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl flex-shrink-0">
        <div className="flex items-center space-x-2">
          <input type="text" value={chatInput} onChange={(e) => onChatInputChange(e.target.value)} placeholder="Type your message..."
            className="flex-grow p-3 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none transition-shadow focus:shadow-md"
            onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { onSendMessage(); e.preventDefault(); }}}
          />
          <button onClick={onSendMessage} disabled={!chatInput.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white p-3 rounded-lg shadow hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed active:bg-emerald-700 dark:active:bg-emerald-800">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Rating Modal Component
function RatingModal({ dspName, onSubmit, onClose }) {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please select a star rating before submitting.");
            return;
        }
        onSubmit(rating, feedback);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md animate-scaleUp">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-200">Rate {dspName}'s Delivery</h2>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"><X size={22}/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6 text-center">
                        <p className="text-slate-600 dark:text-gray-400 mb-3 text-sm sm:text-base">How would you rate the delivery service?</p>
                        <div className="flex justify-center space-x-1 sm:space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`p-2 rounded-full transition-all duration-150 ease-in-out transform hover:scale-110 ${rating >= star ? 'text-amber-400 dark:text-amber-300' : 'text-slate-300 hover:text-amber-300 dark:hover:text-amber-200'}`}
                                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                >
                                    <Star size={32} smSize={36} fill={rating >= star ? "currentColor" : "none"} strokeWidth={1.5} />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && <p className="text-amber-500 dark:text-amber-400 font-semibold mt-2 text-sm">{rating} out of 5 stars</p>}
                    </div>
                    <div className="mb-6">
                        <label htmlFor="feedback" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Additional Feedback (Optional)</label>
                        <textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows="3"
                            placeholder={`Any comments on the delivery by ${dspName}? (e.g., speed, professionalism)`}
                            className="w-full p-2.5 bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-700 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 text-sm"
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        disabled={rating === 0}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg shadow hover:shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed active:bg-emerald-700 dark:active:bg-emerald-800"
                    >
                        <ThumbsUp size={20}/>
                        <span>Submit Rating</span>
                    </button>
                </form>
            </div>
        </div>
    );
}

// Report Issue Modal Component
function ReportIssueModal({ orderId, onSubmit, onClose }) {
    const [issueType, setIssueType] = useState('');
    const [details, setDetails] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!issueType) {
            alert("Please select an issue type.");
            return;
        }
        if (issueType === "Other" && details.trim().length < 5) {
            alert("Please provide a brief description for 'Other' issue type (at least 5 characters).");
            return;
        }
        onSubmit({ orderId, issueType, details: details.trim() });
    };

    const commonIssueTypes = [
        "Order was significantly late",
        "Item(s) were damaged",
        "Missing item(s) from order",
        "Driver behavior was unprofessional",
        "Received incorrect order",
        "Food quality unsatisfactory (restaurant issue)",
        "Other"
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg animate-scaleUp">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-200">Report an Issue</h2>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"><X size={22}/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="issueType" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">What went wrong?</label>
                        <div className="relative">
                            <select
                                id="issueType"
                                value={issueType}
                                onChange={(e) => setIssueType(e.target.value)}
                                className="w-full p-3 pr-10 bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-700 dark:text-gray-200 appearance-none text-sm sm:text-base"
                                required
                            >
                                <option value="" disabled>Select an issue type...</option>
                                {commonIssueTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-gray-400">
                                <ChevronDown size={20} />
                            </div>
                        </div>
                    </div>
                     {issueType && (
                        <div>
                            <label htmlFor="reportDetails" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">
                                {issueType === "Other" ? "Please specify your issue:" : "Additional Details (Optional):"}
                            </label>
                            <textarea
                                id="reportDetails"
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                rows="3"
                                placeholder={issueType === "Other" ? "Explain the issue briefly..." : "Provide any other relevant information..."}
                                className="w-full p-2.5 bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-700 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 text-sm"
                                maxLength={issueType === "Other" ? 200 : 500}
                            ></textarea>
                            <p className="text-xs text-slate-400 dark:text-gray-400 mt-1 text-right">{details.length}/{issueType === "Other" ? 200 : 500}</p>
                        </div>
                     )}
                    <button
                        type="submit"
                        disabled={!issueType || (issueType === "Other" && details.trim().length < 5)}
                        className="w-full bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg shadow hover:shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed active:bg-red-700 dark:active:bg-red-800"
                    >
                        <AlertCircle size={20}/>
                        <span>Submit Report</span>
                    </button>
                </form>
            </div>
        </div>
    );
}

export default App;
