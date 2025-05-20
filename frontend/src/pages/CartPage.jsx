import React, { useEffect, useMemo } from 'react';
import { useCustomerShop } from '../hooks/useCustomerShop';
import { ShoppingCart, User, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function getImageUrl(imagePath, baseUrl = API_BASE_URL) {
  console.log('Original image path:', imagePath);
  console.log('Base URL:', baseUrl);
  
  if (!imagePath) {
    console.log('No image path provided, using placeholder');
    return 'https://placehold.co/64x64/e5e7eb/9ca3af?text=N/A';
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

function Header({ cartItemCount }) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-md border-b border-gray-200 dark:border-gray-700/50 transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button className="flex-shrink-0 flex items-center focus:outline-none">
             <Package className="h-8 w-auto text-emerald-600 dark:text-emerald-500" />
             <a href='/customer' className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">MDS Platform</a>
          </button>
          <div className="flex items-center space-x-3 md:space-x-4">
            <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-emerald-500 rounded-full transition-colors" aria-label="Shopping Cart">
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-emerald-500 rounded-full transition-colors" aria-label="User Menu">
                <User className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default function CartPage() {
  const {
    cart,
    fetchCart,
    updateCartItem,
    deleteCartItem,
    loading,
    error,
  } = useCustomerShop();

  const navigate = useNavigate();
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0), [cart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItem(cartItemId, newQuantity);
  };

  const handleDelete = (cartItemId) => {
    deleteCartItem(cartItemId);
  };

  console.log('CartItemsSummary items:', cart);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header cartItemCount={cart.reduce((sum, item) => sum + (item.quantity || 1), 0)} />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Your Cart</h1>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {cart.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Your cart is empty.</p>
        ) : (
          <ul className="space-y-4">
            {cart.map(item => (
              <li key={item._id} className="flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <img 
                  src={getImageUrl(item.product?.image)} 
                  alt={item.product?.name} 
                  className="w-16 h-16 object-cover rounded-md bg-gray-200 dark:bg-gray-600" 
                  onError={(e) => { 
                    console.error('Image failed to load:', item.product?.image);
                    console.error('Attempted URL:', e.target.src);
                    e.target.onerror = null; 
                    e.target.src = 'https://placehold.co/64x64/e5e7eb/9ca3af?text=N/A';
                  }} 
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 truncate">{item.product?.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                </div>
                <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-8 flex justify-between items-center border-t pt-4 border-gray-200 dark:border-gray-700">
          <span className="text-lg font-semibold">Subtotal:</span>
          <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">${subtotal.toFixed(2)}</span>
        </div>
        {/* Checkout Button */}
        <div className="mt-8 flex justify-end">
          <button
            className="px-6 py-3 bg-emerald-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 transition-colors duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => navigate('/order')}
            disabled={cart.length === 0}
          >
            Proceed to Checkout
          </button>
        </div>
      </main>
    </div>
  );
}
