import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Star, Heart, X, MessageSquare, Filter, ChevronDown, ChevronUp, ShoppingCart, Search, Trash2, User, Settings, LogOut, Package, Info, Phone, Sun, Moon } from 'lucide-react';
import { useCustomerShop } from '../hooks/useCustomerShop';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

// --- Constants ---
const TAX_RATE = 0.15; // 15% Tax Rate
const PAGES = { // Define page constants for navigation
    HOME: 'home',
    DEALS: 'deals',
    NEW_ARRIVALS: 'newArrivals',
    SUPPORT: 'support',
};

// --- Helper Functions ---
const renderRatingStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 dark:text-yellow-500 fill-current" />);
  }
  for (let i = 0; i < 5 - fullStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600" />);
  }
  return <div className="flex items-center">{stars}</div>;
};

function getImageUrl(imagePath, baseUrl = API_BASE_URL) {
  console.log('Original image path:', imagePath);
  console.log('Base URL:', baseUrl);
  
  if (!imagePath) {
    console.log('No image path provided, using placeholder');
    return 'https://placehold.co/300x192/f3f4f6/9ca3af?text=N/A';
  }
  
  // If it's already a full URL, return it
  if (imagePath.startsWith('http')) {
    console.log('Full URL detected:', imagePath);
    return imagePath;
  }
  
  // If it's a relative path starting with /uploads, just prepend the base URL
  if (imagePath.startsWith('/uploads')) {
    const finalUrl = `${baseUrl}${imagePath}`;
    console.log('Relative path with /uploads:', finalUrl);
    return finalUrl;
  }
  
  // For other cases, normalize the path
  let normalizedPath = imagePath
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')
    .replace(/^[/.]+/, '')
    .replace(/^uploads/, '/uploads')
    .replace(/^\/?/, '/');
    
  const finalUrl = `${baseUrl}${normalizedPath}`;
  console.log('Normalized path:', normalizedPath);
  console.log('Final URL:', finalUrl);
  return finalUrl;
}

// --- Main App Component ---
export default function App() {
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
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

// --- Customers Page Component ---
export function CustomersPage() {
  // Integrate backend hook
  const {
    products,
    cart,
    loading,
    error,
    addToCart,
    placeOrder,
    fetchCart,
    fetchProducts,
    setError,
    deleteCartItem
  } = useCustomerShop();

  // State declarations
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilters, setActiveFilters] = useState({ category: '', color: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [savedItems, setSavedItems] = useState(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // State for user menu popover
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system'); // 'light', 'dark', 'system'
  const [currentPage, setCurrentPage] = useState(PAGES.HOME); // State for navigation

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
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(isDark ? 'dark' : 'light');

    localStorage.setItem('theme', theme); // Save preference
  }, [theme]);

  // Effect for listening to system theme changes
  useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
          if (theme === 'system') {
              const isSystemDark = mediaQuery.matches;
              document.documentElement.classList.remove(isSystemDark ? 'light' : 'dark');
              document.documentElement.classList.add(isSystemDark ? 'dark' : 'light');
          }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Effect for filtering products
  useEffect(() => {
    let tempProducts = [...products];
    if (activeFilters.category) {
      tempProducts = tempProducts.filter(p => p.category === activeFilters.category);
    }
    if (activeFilters.color) {
      tempProducts = tempProducts.filter(p => p.color === activeFilters.color);
    }
    if (searchTerm.trim()) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
      tempProducts = tempProducts.filter(p =>
        p.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        p.description.toLowerCase().includes(lowerCaseSearchTerm) ||
        p.category.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    setFilteredProducts(tempProducts);
  }, [activeFilters, products, searchTerm]);

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

  // --- INTEGRATION: Add to Cart ---
  const handleAddToCart = useCallback((productToAdd) => {
    console.log('Adding to cart:', productToAdd);
    // Log the full products array for debugging
    console.log('All products:', products.map(p => ({_id: p._id, id: p.id, name: p.name})));
    // Find the real product (with _id) from products
    const backendProduct = products.find(p => p._id === productToAdd._id);
    if (!backendProduct) {
      console.error('No matching product found in products array for:', productToAdd);
      return;
    }
    console.log('Matched product:', backendProduct);
    // Use backend _id if available, else fallback to id
    const idToAdd = backendProduct._id || backendProduct.id;
    addToCart(idToAdd, 1);
    console.log('Added to cart (id):', idToAdd);
    setIsCartOpen(true);
    setTimeout(() => setIsCartOpen(false), 2500);
  }, [addToCart, products]);

  // --- INTEGRATION: Remove from Cart ---
  const handleRemoveFromCart = useCallback((cartItemId) => {
    console.log('Attempting to remove cart item:', cartItemId);
    deleteCartItem(cartItemId);
  }, [deleteCartItem]);

  // --- INTEGRATION: Update Quantity ---
  const handleUpdateQuantity = async (productId, newQuantity) => {
    // Not implemented in backend: so just ignore for now or show a message
    setError('Update cart quantity is not implemented in backend.');
    };

  const handleToggleCart = () => {
    setIsCartOpen(!isCartOpen);
    if (selectedProduct) handleCloseModal();
    setIsChatOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleToggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    if (selectedProduct) handleCloseModal();
    setIsChatOpen(false);
    setIsCartOpen(false);
  };

  // Handle theme change
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setIsUserMenuOpen(false);
  };

  // Handle navigation
  const handleNavigate = (page) => {
    setCurrentPage(page);
    setIsCartOpen(false);
    setIsUserMenuOpen(false);
    setSelectedProduct(null);
    setIsChatOpen(false);
    setIsFilterOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setSavedItems(new Set());
      setIsUserMenuOpen(false);
      window.location.href = '/auth';
  };

  // --- Render Content Based on Page ---
  const renderPageContent = () => {
    switch (currentPage) {
      case PAGES.HOME:
        return (
          <>
            {/* Top Bar: Title, Search, Filter Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 dark:from-emerald-500 dark:to-cyan-500">
                Discover Products
              </h1>
              {/* Search Input */}
              <div className="relative w-full md:w-1/2 lg:w-1/3">
                <input
                  type="search"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-150 ease-in-out backdrop-blur-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              {/* Filter Toggle Button (Mobile) */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="md:hidden p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>

            {/* Frequently Bought Section */}
            <FrequentlyBoughtSection
              products={frequentlyBoughtItems}
              onProductSelect={handleProductSelect}
              onSaveToggle={handleSaveToggle}
              savedItems={savedItems}
              onAddToCart={handleAddToCart}
            />

            {/* Separator */}
            <hr className="my-8 border-gray-300 dark:border-gray-700/50" />

            {/* All Products Section Title */}
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">All Products</h2>
            {/* Product Grid */}
            <ProductGrid
              products={filteredProducts}
              onProductSelect={handleProductSelect}
              onSaveToggle={handleSaveToggle}
              savedItems={savedItems}
              onAddToCart={handleAddToCart}
            />
          </>
        );
      case PAGES.DEALS:
        return <DealsPage />;
      case PAGES.NEW_ARRIVALS:
        return <NewArrivalsPage />;
      case PAGES.SUPPORT:
        return <SupportPage />;
      default:
        return <p>Page not found.</p>;
    }
  };

  // --- Final Render ---
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header Component */}
      <Header
        cartItemCount={cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}
        onCartClick={handleToggleCart}
        onUserClick={handleToggleUserMenu}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1">
        {/* Filter Sidebar - Only show on Home page */}
        {currentPage === PAGES.HOME && (
            <FilterSidebar
              categories={categories}
              colors={colors}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
            />
        )}

        {/* Content Area */}
        <main className={`flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto relative ${currentPage !== PAGES.HOME ? 'w-full' : ''}`}>
          {/* Popovers */}
          {isCartOpen && (
            <CartPopover
              cartItems={cart}
              onClose={handleToggleCart}
              onRemove={handleRemoveFromCart}
              onUpdateQuantity={handleUpdateQuantity}
            />
          )}
           {isUserMenuOpen && (
            <UserMenuPopover
              onClose={handleToggleUserMenu}
              onThemeChange={handleThemeChange}
              currentTheme={theme}
              onLogout={handleLogout}
            />
          )}

          {/* Render Page Content */}
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {loading && <div className="text-center text-emerald-600 dark:text-emerald-400 py-4">Loading...</div>}
            {error && <div className="text-center text-red-600 dark:text-red-400 py-4">{error}</div>}
            {renderPageContent()}
          </div>
        </main>
      </div>

      {/* Footer Component */}
      <Footer />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
            product={selectedProduct}
            onClose={handleCloseModal}
            onAddToCart={handleAddToCart}
        />
      )}

      {/* Floating Chat Icon */}
      <button
        onClick={handleToggleChat}
        className="fixed bottom-24 right-6 z-40 p-4 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-slate-900 transition-transform duration-200 hover:scale-110 animate-pulse"
        aria-label="Open Chat"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Interface */}
      {isChatOpen && <ChatInterface onClose={handleToggleChat} />}
    </div>
  );
}

// --- Sub Components ---

// Header Component
function Header({ cartItemCount, onCartClick, onUserClick, onNavigate, currentPage }) {
  // Helper to determine if a nav link is active
  const isNavLinkActive = (page) => currentPage === page;

  return (
    // Use theme-aware background and border colors
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-md border-b border-gray-200 dark:border-gray-700/50 transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <button onClick={() => onNavigate(PAGES.HOME)} className="flex-shrink-0 flex items-center focus:outline-none">
             <Package className="h-8 w-auto text-emerald-600 dark:text-emerald-500" />
             {/* Theme-aware text color */}
             <a href='/customer' className="ml-2 text-xl font-bold text-black dark:text-gray-100">MDS Platform</a>
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <button
                onClick={() => onNavigate(PAGES.HOME)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isNavLinkActive(PAGES.HOME) ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
            >
                Home
            </button>
            <button
                onClick={() => onNavigate(PAGES.DEALS)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isNavLinkActive(PAGES.DEALS) ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
            >
                Deals
            </button>
            <button
                onClick={() => onNavigate(PAGES.NEW_ARRIVALS)}
                 className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isNavLinkActive(PAGES.NEW_ARRIVALS) ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
            >
                New Arrivals
            </button>
             <button
                onClick={() => onNavigate(PAGES.SUPPORT)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isNavLinkActive(PAGES.SUPPORT) ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
            >
                Support
            </button>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-3 md:space-x-4">
             {/* Cart Icon */}
            <button
                onClick={onCartClick}
                className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-emerald-500 rounded-full transition-colors"
                aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>
             {/* User/Account Icon */}
             <button
                onClick={onUserClick}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-emerald-500 rounded-full transition-colors"
                aria-label="User Menu"
            >
                <User className="h-6 w-6" />
             </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

// Footer Component
function Footer() {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md animate-scaleUp">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-200">Rate {dspName}'s Delivery</h2>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"><X size={22}/></button>
                </div>
                <p>&copy; {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
                <p>Debre Markos, Ethiopia</p>
            </div>
        </footer>
    );
}

// User Menu Popover Component
function UserMenuPopover({ onClose, onThemeChange, currentTheme, onLogout }) {
  return (
    <div className="absolute top-16 right-4 md:right-6 lg:right-10 z-50 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col animate-fade-in-down overflow-hidden">
       {/* Close Button */}
        <button onClick={onClose} className="absolute top-1 right-1 p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500">
          <X className="w-4 h-4" />
        </button>
        {/* Menu Items */}
        <div className="py-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Theme</div>
            {/* Theme Toggle Buttons */}
            <div className="flex justify-around px-2 py-1">
                 <button
                    onClick={() => onThemeChange('light')}
                    className={`p-2 rounded-md ${currentTheme === 'light' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    aria-label="Light Theme"
                 >
                    <Sun className="w-5 h-5"/>
                 </button>
                 <button
                    onClick={() => onThemeChange('dark')}
                    className={`p-2 rounded-md ${currentTheme === 'dark' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    aria-label="Dark Theme"
                 >
                    <Moon className="w-5 h-5"/>
                 </button>
                 <button
                    onClick={() => onThemeChange('system')}
                    className={`p-2 rounded-md ${currentTheme === 'system' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    aria-label="System Theme"
                 >
                    <Settings className="w-5 h-5"/> {/* Using Settings icon for System */}
                 </button>
            </div>
             <hr className="border-gray-200 dark:border-gray-700 my-1" />
             {/* Account Settings (Placeholder) */}
             <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
                <User className="w-4 h-4"/>
                <span>Account</span>
             </button>
             {/* Logout Button */}
             <button
                onClick={onLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center space-x-2"
            >
                <LogOut className="w-4 h-4"/>
                <span>Logout</span>
             </button>
        </div>
        {/* Animation Style */}
        <style jsx global>{`
         @keyframes fadeInDown {
           from { opacity: 0; transform: translateY(-10px) scale(0.95); }
           to { opacity: 1; transform: translateY(0) scale(1); }
         }
         .animate-fade-in-down { animation: fadeInDown 0.2s ease-out forwards; }
       `}</style>
    </div>
  );
}


// Cart Popover Component
function CartPopover({ cartItems, onClose, onRemove, onUpdateQuantity }) {
  const navigate = useNavigate();
  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0),
    [cartItems]
  );
  const total = subtotal; // No tax

  return (
    // Use theme-aware colors
    <div className="absolute top-16 right-4 md:right-8 lg:right-12 z-50 w-80 max-h-[70vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col animate-fade-in-down">
      {/* Popover Header */}
      <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <h3 className="font-semibold text-md text-gray-900 dark:text-gray-100">Shopping Cart</h3>
        <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Cart Body */}
      <div className="flex-1 p-3 overflow-y-auto">
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">Your cart is empty.</p>
        ) : (
          <ul className="space-y-3">
            {cartItems.map(item => (
              <li key={item._id || item.id} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <img
                  src={getImageUrl(item.product?.image)}
                  alt={item.product?.name}
                  className="w-12 h-12 object-cover rounded-md flex-shrink-0 bg-gray-200 dark:bg-gray-600"
                  onError={(e) => {
                    console.error('Image failed to load:', item.product?.image);
                    console.error('Attempted URL:', e.target.src);
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/48x48/e5e7eb/9ca3af?text=N/A';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.product?.name}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">Qty:</span>
                    <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onUpdateQuantity(item._id || item.id, e.target.value)}
                        className="w-12 px-1 py-0.5 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-xs text-center text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                   <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                </div>
                <button onClick={() => { console.log('Remove button clicked for cart item:', item._id); onRemove(item._id); }} className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Cart Footer (Totals) */}
      {cartItems.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 z-10">
          <div className="space-y-1 text-sm mb-3">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>
          <button
            className="w-full px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out mb-2"
            onClick={() => navigate('/cart')}
          >
            View Cart Details
          </button>
        </div>
      )}
       {/* Animation Style */}
       <style jsx global>{`
         @keyframes fadeInDown {
           from { opacity: 0; transform: translateY(-10px); }
           to { opacity: 1; transform: translateY(0); }
         }
         .animate-fade-in-down { animation: fadeInDown 0.3s ease-out forwards; }
         input[type=number]::-webkit-inner-spin-button,
         input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
         input[type=number] { -moz-appearance: textfield; }
       `}</style>
    </div>
  );
}


// Filter Sidebar Component - Themed
function FilterSidebar({ categories, colors, activeFilters, onFilterChange, isOpen, onClose }) {
  const [openSections, setOpenSections] = useState({ category: true, color: true });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleRadioChange = (type, value) => {
    if (activeFilters[type] === value) onFilterChange(type, '');
    else onFilterChange(type, value);
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm" onClick={onClose}></div>}
      {/* Sidebar Container - Theme-aware */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 md:z-10 w-64 h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg md:shadow-none border-r border-gray-200 dark:border-gray-700/50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:top-0 md:flex-shrink-0 md:h-screen md:overflow-y-auto`}>
        <div className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
            <button onClick={onClose} className="md:hidden p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <button onClick={() => toggleSection('category')} className="w-full flex justify-between items-center text-left font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 mb-2 focus:outline-none">
              <span>Category</span>
              {openSections.category ? <ChevronUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openSections.category && (
              <div className="space-y-1 pl-2 border-l border-gray-300 dark:border-gray-700 ml-1">
                 <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50">
                   <input type="radio" name="category" value="" checked={!activeFilters.category} onChange={() => onFilterChange('category', '')} className="form-radio h-4 w-4 text-emerald-600 dark:text-emerald-500 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 focus:ring-emerald-500 transition duration-150 ease-in-out cursor-pointer"/>
                   <span>All Categories</span>
                 </label>
                {categories.map(category => (
                  <label key={category} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50">
                    <input type="radio" name="category" value={category} checked={activeFilters.category === category} onChange={() => handleRadioChange('category', category)} className="form-radio h-4 w-4 text-emerald-600 dark:text-emerald-500 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 focus:ring-emerald-500 transition duration-150 ease-in-out cursor-pointer"/>
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Color Filter */}
          <div className="mb-6">
            <button onClick={() => toggleSection('color')} className="w-full flex justify-between items-center text-left font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 mb-2 focus:outline-none">
              <span>Color</span>
               {openSections.color ? <ChevronUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openSections.color && (
              <div className="space-y-1 pl-2 border-l border-gray-300 dark:border-gray-700 ml-1">
                <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50">
                   <input type="radio" name="color" value="" checked={!activeFilters.color} onChange={() => onFilterChange('color', '')} className="form-radio h-4 w-4 text-emerald-600 dark:text-emerald-500 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 focus:ring-emerald-500 transition duration-150 ease-in-out cursor-pointer"/>
                   <span>All Colors</span>
                 </label>
                {colors.map(color => (
                  <label key={color} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50">
                    <input type="radio" name="color" value={color} checked={activeFilters.color === color} onChange={() => handleRadioChange('color', color)} className="form-radio h-4 w-4 text-emerald-600 dark:text-emerald-500 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 focus:ring-emerald-500 transition duration-150 ease-in-out cursor-pointer"/>
                    <span>{color}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

// Frequently Bought Section Component - Themed
function FrequentlyBoughtSection({ products, onProductSelect, onSaveToggle, savedItems, onAddToCart }) {
    if (!products || products.length === 0) return null;
   return (
     <div className="mb-8">
       {/* Theme-aware text */}
       <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Frequently Bought Together</h2>
       {/* Theme-aware scrollbar */}
       <div className="flex space-x-4 md:space-x-6 overflow-x-auto pb-4 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
          {products.map(product => (
            <div key={`freq-${product.id}`} className="flex-shrink-0 w-64 sm:w-72">
                <ProductCard
                    product={product}
                    onSelect={onProductSelect}
                    onSaveToggle={onSaveToggle}
                    isSaved={savedItems.has(product.id)}
                    onAddToCart={onAddToCart}
                />
            </div>
          ))}
       </div>
        <style jsx global>{`
            .scrollbar-thin { scrollbar-width: thin; }
            .scrollbar-thin::-webkit-scrollbar { height: 8px; }
            .scrollbar-thin::-webkit-scrollbar-track { border-radius: 10px; }
            .scrollbar-thin::-webkit-scrollbar-thumb { border-radius: 10px; }
            /* Light theme scrollbar */
            .light .scrollbar-thin { scrollbar-color: #9CA3AF #E5E7EB; }
            .light .scrollbar-thin::-webkit-scrollbar-track { background: #E5E7EB; }
            .light .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #9CA3AF; border: 2px solid #E5E7EB; }
            .light .scrollbar-thin::-webkit-scrollbar-thumb:hover { background-color: #6B7280; }
            /* Dark theme scrollbar */
            .dark .scrollbar-thin { scrollbar-color: #4B5563 #1F2937; }
            .dark .scrollbar-thin::-webkit-scrollbar-track { background: #1f2937; }
            .dark .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #4b5563; border: 2px solid #1f2937; }
            .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover { background-color: #6b7280; }
        `}</style>
     </div>
   );
}


// Product Grid Component - Themed
function ProductGrid({ products, onProductSelect, onSaveToggle, savedItems, onAddToCart }) {
  if (!products || products.length === 0) {
    // Theme-aware text
    return <p className="text-center text-gray-500 dark:text-gray-400 mt-10">No products found matching your criteria.</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={onProductSelect}
          onSaveToggle={onSaveToggle}
          isSaved={savedItems.has(product.id)}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}


// Product Card Component - Themed
function ProductCard({ product, onSelect, onSaveToggle, isSaved, onAddToCart }) {
  const [isAnimatingHeart, setIsAnimatingHeart] = useState(false);

  const handleHeartClick = (e) => {
      e.stopPropagation();
      onSaveToggle(product.id);
      setIsAnimatingHeart(true);
      setTimeout(() => setIsAnimatingHeart(false), 300);
  };

  const handleCartClick = (e) => {
    e.stopPropagation();
    console.log('Add to Cart button clicked (id):', product._id || product.id);
    onAddToCart(product);
  };

  return (
    // Theme-aware card styles
    <div className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-md overflow-hidden hover:shadow-lg dark:hover:shadow-emerald-900/40 transition-all duration-300 ease-in-out group flex flex-col border border-gray-200 dark:border-gray-700/50 hover:border-emerald-300 dark:hover:border-emerald-700/50">
      {/* Image Section */}
      <div className="relative">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="w-full h-48 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
          onClick={() => onSelect(product)}
          onError={(e) => { 
            console.error('Image failed to load:', product.image);
            console.error('Attempted URL:', e.target.src);
            e.target.onerror = null; 
            e.target.src = 'https://placehold.co/400x400/f3f4f6/9ca3af?text=Not+Found';
          }}
        />
        {/* Save Icon Button - Theme-aware */}
        <button
          onClick={handleHeartClick}
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200 ease-in-out ${
            isSaved ? 'bg-red-500/90 text-white' : 'bg-gray-100/70 dark:bg-gray-900/60 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-200/80 dark:hover:bg-gray-700/80'
          } ${isAnimatingHeart ? 'animate-heart-pop' : ''} backdrop-blur-sm`}
          aria-label={isSaved ? 'Unsave item' : 'Save item'}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Card Content Section - Theme-aware */}
      <div className="p-4 flex flex-col flex-grow">
        <h3
          className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          onClick={() => onSelect(product)}
          title={product.name}
        >
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{product.category}</p>
        <div className="flex justify-between items-center mb-3">
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-500">${product.price.toFixed(2)}</p>
          {/* renderRatingStars is already theme-aware */}
          {renderRatingStars(product.rating)}
        </div>
        {/* Add to Cart Button - Theme-aware */}
        <button
           onClick={handleCartClick}
           className="w-full mt-auto px-4 py-2 bg-gray-100 dark:bg-gray-700/80 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 transition-all duration-300 ease-in-out flex items-center justify-center space-x-1 group/button hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] dark:hover:shadow-[0_0_15px_rgba(16,185,129,0.6)] focus:shadow-[0_0_15px_rgba(16,185,129,0.6)]"
        >
          <ShoppingCart className="w-4 h-4 transition-colors duration-300"/>
          <span className="transition-colors duration-300">Add to Cart</span>
        </button>
      </div>
      {/* Heart Animation */}
      <style jsx global>{`
        @keyframes heartPop { 0% { transform: scale(1); } 50% { transform: scale(1.4); } 100% { transform: scale(1); } }
        .animate-heart-pop { animation: heartPop 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}


// Product Detail Modal Component - Themed
function ProductDetailModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  const handleModalCartClick = (e) => {
    e.stopPropagation();
    console.log('Add to Cart button clicked (modal, id):', product._id || product.id);
    onAddToCart(product);
    // onClose(); // Keep modal open after adding
  };

  return (
    // Modal Overlay - Theme-aware
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out" onClick={onClose}>
      {/* Modal Content - Theme-aware */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-fade-in-up border border-gray-200 dark:border-gray-700/50" onClick={(e) => e.stopPropagation()}>
        {/* Close Button - Theme-aware */}
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 z-10" aria-label="Close modal">
          <X className="w-6 h-6" />
        </button>
        {/* Modal Body */}
        <div className="p-6 md:p-8">
            <div className="md:grid md:grid-cols-2 md:gap-8">
                {/* Image Column */}
                <div className="mb-4 md:mb-0 flex items-center justify-center">
                    <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-full max-w-sm h-auto max-h-96 object-contain rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700/30"
                        onError={(e) => { 
                            console.error('Image failed to load:', product.image);
                            console.error('Attempted URL:', e.target.src);
                            e.target.onerror = null; 
                            e.target.src = 'https://placehold.co/400x400/f3f4f6/9ca3af?text=Not+Found';
                        }}
                    />
                </div>
                {/* Details Column - Theme-aware text */}
                <div className="flex flex-col justify-center">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{product.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{product.category} - {product.color}</p>
                    <div className="flex items-center mb-4">
                        {renderRatingStars(product.rating)}
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({product.rating.toFixed(1)} rating)</span>
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
