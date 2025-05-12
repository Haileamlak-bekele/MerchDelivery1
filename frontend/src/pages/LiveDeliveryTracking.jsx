import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Phone, Clock, User, Bike, Check, Package, Store } from 'lucide-react';

// --- Configuration & Mock Data ---
const MAP_WIDTH = 500; // Width of the simulated map area
const MAP_HEIGHT = 300; // Height of the simulated map area

// Mock locations (adjust coordinates for positioning within the simulated map)
const merchantLocation = { x: 50, y: 50, name: 'Awesome Gadgets Store' }; // Top-left area
const customerLocation = { x: 450, y: 250, name: 'Your Location' }; // Bottom-right area

// Mock Rider Info
const mockRider = {
  name: 'Alex R.',
  phone: '+251-XXX-XXXX', // Placeholder
  rating: 4.8,
};

// Delivery Stages
const deliveryStages = ['Preparing', 'Picked Up', 'En Route', 'Arriving Soon', 'Delivered'];

// --- Main App Component (for context) ---
export default function App() {
  // In a real app, DeliveryTrackingPage would be rendered by a route,
  // likely passing a delivery ID to fetch real data.
  return <DeliveryTrackingPage deliveryId="order-12345" />;
}

// --- Delivery Tracking Page Component ---
function DeliveryTrackingPage({ deliveryId }) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0); // Index in deliveryStages
  const [riderPosition, setRiderPosition] = useState({ x: merchantLocation.x, y: merchantLocation.y });
  const [eta, setEta] = useState('15 Mins'); // Initial ETA
  const [simulationIntervalId, setSimulationIntervalId] = useState(null);

  const currentStatus = deliveryStages[currentStageIndex];

  // Simulate delivery progress
  useEffect(() => {
    // Clear any existing interval when component mounts or deliveryId changes
    if (simulationIntervalId) {
      clearInterval(simulationIntervalId);
    }

    // Start simulation only if not delivered
    if (currentStageIndex < deliveryStages.length - 1) {
      const intervalId = setInterval(() => {
        // --- Simulate Rider Movement ---
        setRiderPosition(prevPos => {
          // Simple linear interpolation towards customer location
          const targetX = customerLocation.x;
          const targetY = customerLocation.y;
          const dx = targetX - prevPos.x;
          const dy = targetY - prevPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Stop moving if close enough (or delivered)
          if (distance < 10 || currentStageIndex >= deliveryStages.length - 1) {
             if (currentStageIndex < deliveryStages.length - 1) { // If close but not delivered yet
                setCurrentStageIndex(deliveryStages.length - 2); // Set to 'Arriving Soon'
                setEta('1 Min');
             }
            return prevPos;
          }

          // Move a fraction of the distance each step
          const moveFraction = 0.08; // Adjust speed here
          const nextX = prevPos.x + dx * moveFraction;
          const nextY = prevPos.y + dy * moveFraction;

          return { x: nextX, y: nextY };
        });

        // --- Simulate Status Update ---
        // Logic to advance stage based on time or rider position
        // Example: Advance stage roughly based on progress
        const progress = calculateProgress(riderPosition, merchantLocation, customerLocation);

        if (progress > 0.1 && currentStageIndex < 1) {
            setCurrentStageIndex(1); // Picked Up
            setEta('12 Mins');
        } else if (progress > 0.2 && currentStageIndex < 2) {
            setCurrentStageIndex(2); // En Route
            setEta('8 Mins');
        } else if (progress > 0.85 && currentStageIndex < 3) {
            setCurrentStageIndex(3); // Arriving Soon
            setEta('~2 Mins');
        }

        // --- Simulate Delivery Completion (Example: based on distance) ---
         const dx = customerLocation.x - riderPosition.x;
         const dy = customerLocation.y - riderPosition.y;
         const finalDistance = Math.sqrt(dx * dx + dy * dy);
         if (finalDistance < 5 && currentStageIndex < deliveryStages.length - 1) {
            setCurrentStageIndex(deliveryStages.length - 1); // Delivered
            setEta('Delivered');
            setRiderPosition({ x: customerLocation.x, y: customerLocation.y }); // Snap to final location
            clearInterval(intervalId); // Stop simulation
         }

      }, 1000); // Update every second

      setSimulationIntervalId(intervalId);
    }

    // Cleanup function to clear interval on unmount
    return () => {
      if (simulationIntervalId) {
        clearInterval(simulationIntervalId);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryId, currentStageIndex]); // Rerun simulation if deliveryId changes or stage is manually updated


  // Helper to calculate rough progress percentage
  const calculateProgress = (current, start, end) => {
      const totalDist = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
      if (totalDist === 0) return 1; // Avoid division by zero
      const traveledDist = Math.sqrt(Math.pow(current.x - start.x, 2) + Math.pow(current.y - start.y, 2));
      return Math.min(traveledDist / totalDist, 1); // Cap at 1
  };

  const handleContactRider = () => {
    // Placeholder - In real app, initiate call or chat
    alert(`Contacting rider ${mockRider.name} at ${mockRider.phone} (Placeholder)`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-indigo-900 text-gray-200 font-sans p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center overflow-hidden">
      <div className="w-full max-w-4xl bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center">
            <Package className="w-6 h-6 mr-3 text-indigo-400" />
            Track Your Delivery ({deliveryId})
          </h1>
          {/* Maybe add a refresh button or order details link */}
        </div>

        <div className="md:flex">
          {/* Map Simulation Area */}
          <div className="w-full md:w-2/3 p-4 md:p-6 relative bg-gray-800/30 md:border-r border-white/10">
            <MapSimulation
                riderPosition={riderPosition}
                merchantLocation={merchantLocation}
                customerLocation={customerLocation}
            />
          </div>

          {/* Tracking Details Panel */}
          <div className="w-full md:w-1/3 p-4 md:p-6 flex flex-col">
            <TrackingDetailsPanel
                status={currentStatus}
                eta={eta}
                rider={mockRider}
                onContact={handleContactRider}
                currentStageIndex={currentStageIndex}
                stages={deliveryStages}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub Components ---

// Map Simulation Component
function MapSimulation({ riderPosition, merchantLocation, customerLocation }) {
  return (
    <div
      className="relative w-full h-[300px] md:h-[400px] bg-gray-900/50 border border-indigo-500/20 rounded-lg overflow-hidden shadow-inner"
      style={{
        // Basic grid background for map effect
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
        backgroundSize: `20px 20px`,
      }}
    >
      {/* Merchant Marker */}
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
        style={{ left: `${merchantLocation.x}px`, top: `${merchantLocation.y}px` }}
        title={`Merchant: ${merchantLocation.name}`}
      >
        <Store className="w-6 h-6 text-green-400 drop-shadow-lg" />
        <span className="text-xs text-green-300 bg-black/50 px-1 rounded mt-1">Store</span>
      </div>

      {/* Customer Marker */}
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
        style={{ left: `${customerLocation.x}px`, top: `${customerLocation.y}px` }}
        title="Your Location"
      >
        <MapPin className="w-6 h-6 text-blue-400 drop-shadow-lg" />
         <span className="text-xs text-blue-300 bg-black/50 px-1 rounded mt-1">You</span>
      </div>

      {/* Rider Marker with Pulse */}
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear"
        style={{ left: `${riderPosition.x}px`, top: `${riderPosition.y}px` }}
        title={`Rider: ${mockRider.name}`}
      >
        {/* Pulsing outer circle */}
        <div className="absolute inset-0 -m-1 rounded-full bg-indigo-500/50 animate-pulse-rider"></div>
         {/* Inner icon */}
        <div className="relative z-10 bg-indigo-600 rounded-full p-1 shadow-lg border-2 border-white/50">
           <Bike className="w-5 h-5 text-white" />
        </div>

      </div>

       {/* Simple Line for Route (approximated) */}
       <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}>
            <line
                x1={merchantLocation.x}
                y1={merchantLocation.y}
                x2={customerLocation.x}
                y2={customerLocation.y}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="2"
                strokeDasharray="4 4"
            />
             {/* Optional: Line showing rider's path so far */}
             <line
                x1={merchantLocation.x}
                y1={merchantLocation.y}
                x2={riderPosition.x}
                y2={riderPosition.y}
                stroke="rgba(99, 102, 241, 0.6)" // Indigo color
                strokeWidth="3"
            />
       </svg>

        {/* CSS for Rider Pulse Animation */}
        <style jsx global>{`
            @keyframes pulse-rider {
              0%, 100% { transform: scale(1); opacity: 0.5; }
              50% { transform: scale(1.8); opacity: 0; }
            }
            .animate-pulse-rider {
              animation: pulse-rider 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
      `}</style>
    </div>
  );
}

// Tracking Details Panel Component
function TrackingDetailsPanel({ status, eta, rider, onContact, currentStageIndex, stages }) {
  return (
    <div className="flex flex-col h-full justify-between space-y-6">
        <div>
            {/* Status Bar */}
            <StatusBar stages={stages} currentStageIndex={currentStageIndex} />

            {/* Current Status & ETA */}
            <div className="text-center my-6">
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Current Status</p>
                <p className="text-2xl font-bold text-indigo-300 animate-pulse-fast">{status}</p>
                <div className="mt-4 flex items-center justify-center text-gray-400">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">Estimated Arrival: <span className="font-medium text-gray-200">{eta}</span></span>
                </div>
            </div>

            {/* Rider Information */}
            <div className="bg-white/10 border border-white/10 rounded-lg p-4 text-center space-y-2">
                <User className="w-10 h-10 mx-auto text-indigo-400 bg-indigo-900/50 p-2 rounded-full border border-indigo-500/30" />
                <p className="text-md font-semibold text-white">{rider.name}</p>
                {/* <p className="text-xs text-gray-400">Rating: {rider.rating} ★</p> */}
                 <button
                    onClick={onContact}
                    className="w-full mt-3 flex items-center justify-center px-4 py-2 bg-teal-600/80 text-white text-sm font-medium rounded-md hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-150 ease-in-out"
                >
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Rider
                </button>
            </div>
        </div>

        {/* Footer Note (Optional) */}
        <p className="text-xs text-center text-gray-500 mt-auto pt-4">
            Live tracking is approximate. Actual arrival may vary.
        </p>
    </div>
  );
}


// Status Bar Component
function StatusBar({ stages, currentStageIndex }) {
  return (
    <div className="w-full px-2">
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-gray-700"></div>
        {/* Progress Line */}
        <div
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
        ></div>

        {/* Stage Dots and Labels */}
        {stages.map((stage, index) => {
          const isActive = index === currentStageIndex;
          const isCompleted = index < currentStageIndex;
          return (
            <div key={stage} className="relative z-10 flex flex-col items-center text-center w-[20%]"> {/* Adjust width based on number of stages */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  isActive ? 'bg-indigo-500 border-indigo-300 scale-110 shadow-lg shadow-indigo-500/50' : isCompleted ? 'bg-indigo-700 border-indigo-500' : 'bg-gray-600 border-gray-500'
                }`}
              >
                {isCompleted && <Check className="w-3 h-3 text-white" />}
                 {isActive && <div className="w-2 h-2 bg-white rounded-full animate-ping absolute"></div>}
              </div>
              <span className={`mt-2 text-xs font-medium transition-colors duration-300 ${isActive ? 'text-indigo-300' : isCompleted ? 'text-gray-300' : 'text-gray-500'}`}>
                {stage}
              </span>
            </div>
          );
        })}
      </div>
       {/* CSS for Status Pulse Animation */}
        <style jsx global>{`
            @keyframes pulse-fast {
              0%, 100% { opacity: 0.7; } 50% { opacity: 1; }
            }
            .animate-pulse-fast { animation: pulse-fast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
}

