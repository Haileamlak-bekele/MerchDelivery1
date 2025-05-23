import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Star, Heart, X, MessageSquare, Filter, ChevronDown, ChevronUp, ShoppingCart, Search, Trash2, User, Settings, LogOut, Package, Info, Phone, Sun, Moon } from 'lucide-react';
import { useCustomerShop } from '../hooks/useCustomerShop';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import CustomerTrackingOrders from '../components/CustomerTrackingPage';

// --- Constants ---
const TAX_RATE = 0.15; // 15% Tax Rate
const PAGES = { // Define page constants for navigation
    HOME: 'home',
    DEALS: 'deals',
    NEW_ARRIVALS: 'newArrivals',
    SUPPORT: 'support',
    MY_ORDERS: 'myOrders',
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
    }, []);
    return <CustomersPage />;
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

  // Memoized values
  const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);
  const colors = useMemo(() => [...new Set(products.map(p => p.color))], [products]);
  const frequentlyBoughtItems = useMemo(() => products.filter(p => p.isFrequentlyBought), [products]);

  // --- Effects ---

  // Effect for applying theme
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

  // --- Event Handlers ---

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setIsCartOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (selectedProduct) handleCloseModal();
    setIsCartOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleSaveToggle = (productId) => {
    setSavedItems(prev => {
      const newSavedItems = new Set(prev);
      if (newSavedItems.has(productId)) newSavedItems.delete(productId);
      else newSavedItems.add(productId);
      return newSavedItems;
    });
  };

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
        case PAGES.MY_ORDERS:
         return <CustomerTrackingOrders/>; 
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
            <button 
               onClick={()=>onNavigate(PAGES.MY_ORDERS)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isNavLinkActive(PAGES.MY_ORDERS) ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
                >
                  My Orders
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
        // Use theme-aware background and border colors
        <footer className="bg-gray-200 dark:bg-slate-900 border-t border-gray-300 dark:border-gray-700/50 mt-auto transition-colors duration-300">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400 text-sm">
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 mb-4">
                    {/* Use theme-aware hover colors */}
                    <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center"><Info className="w-4 h-4 mr-1"/> About Us</a>
                    <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center"><Phone className="w-4 h-4 mr-1"/> Contact</a>
                    <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center"><Settings className="w-4 h-4 mr-1"/> Terms of Service</a>
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
                    <p className="text-3xl lg:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-5">${product.price.toFixed(2)}</p>
                    <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-1">Description</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">{product.description}</p>
                    {/* Action Buttons - Theme-aware */}
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-auto">
                        <button
                            onClick={handleModalCartClick}
                            className="flex-1 px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out flex items-center justify-center space-x-1.5 shadow-md hover:shadow-lg"
                        >
                            <ShoppingCart className="w-5 h-5"/>
                            <span>Add to Cart</span>
                        </button>
                        <button className="flex-1 px-5 py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out flex items-center justify-center space-x-1.5 shadow-md hover:shadow-lg">
                            <Heart className="w-5 h-5" />
                            <span>Save Item</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
      {/* Modal Animation */}
      <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}


// Chat Interface Placeholder Component - Themed
function ChatInterface({ onClose }) {
  return (
    // Theme-aware chat container
    <div className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 dark:border-gray-700/50 flex flex-col animate-fade-in-up">
      {/* Header - Theme-aware */}
      <div className="flex justify-between items-center p-3 bg-emerald-600/90 dark:bg-emerald-700/80 text-white rounded-t-lg border-b border-emerald-500/50 dark:border-emerald-600/50">
        <h3 className="font-semibold text-md">Chat Support</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-emerald-500 dark:hover:bg-emerald-600 focus:outline-none focus:ring-1 focus:ring-white">
          <X className="w-5 h-5" />
        </button>
      </div>
      {/* Body - Theme-aware */}
      <div className="flex-1 p-4 overflow-y-auto text-sm flex flex-col space-y-2">
        {/* Received Message - Theme-aware */}
        <div className="flex justify-start">
             <p className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 p-2 rounded-lg max-w-[80%]">Hello! How can I help you today?</p>
        </div>
         {/* Sent Message - Theme-aware */}
         <div className="flex justify-end">
             <p className="bg-emerald-500 dark:bg-emerald-600 text-white p-2 rounded-lg max-w-[80%]">I have a question about product #5.</p>
         </div>
         <div className="flex-grow flex items-end">
            <p className="text-center text-gray-400 dark:text-gray-500 text-xs w-full">Chat interface placeholder</p>
         </div>
      </div>
      {/* Input Area - Theme-aware */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700/50">
        <input
            type="text"
            placeholder="Type your message..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>
      {/* Chat Animation */}
       <style jsx global>{`
         @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
         .animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
       `}</style>
    </div>
  );
}

// --- Placeholder Page Components ---

function DealsPage() {
    return (
        <div className="text-center py-10">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Deals Page</h2>
            <p className="text-gray-600 dark:text-gray-400">Exciting deals coming soon!</p>
        </div>
    );
}

function NewArrivalsPage() {
    return (
        <div className="text-center py-10">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">New Arrivals</h2>
            <p className="text-gray-600 dark:text-gray-400">Check out the latest products!</p>
             {/* You could potentially reuse ProductGrid here with different data */}
        </div>
    );
}

function SupportPage() {
    return (
        <div className="text-center py-10">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Support Center</h2>
            <p className="text-gray-600 dark:text-gray-400">How can we help you?</p>
            {/* Add FAQs, contact form, etc. */}
        </div>
    );
}

function MyOrdersPage() {
  return (
    <div className="text-center py-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">My Orders</h2>
      <p className="text-gray-600 dark:text-gray-400">You have not placed any orders yet.</p>
    </div>
  );
}
