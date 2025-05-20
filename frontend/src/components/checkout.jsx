import React, { useState, useEffect } from 'react';
import { useCheckout } from '../hooks/useCheckout';
import { ShoppingCart, Package } from 'lucide-react';
import { API_BASE_URL } from '../config';
import MapPicker from './MapModal.jsx'; // Ensure this path is correct

function getImageUrl(imagePath, baseUrl = API_BASE_URL) {
  console.log('Original image path:', imagePath);
  console.log('Base URL:', baseUrl);
  
  if (!imagePath) {
    console.log('No image path provided, using placeholder');
    return 'https://placehold.co/48x48/e5e7eb/9ca3af?text=N/A';
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

// --- Cart Items Summary ---
const CartItemsSummary = ({ items }) => {
  console.log('CartItemsSummary items (checkout):', items);
  return (
  <div>
    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
      <ShoppingCart className="w-5 h-5 text-emerald-600" /> Cart Items
    </h2>
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {items.map(item => (
          <li key={item.id || item._id} className="py-3 flex items-center">
            <img 
              src={getImageUrl(item.image || item.product?.image)} 
              alt={item.name || item.product?.name} 
              className="w-12 h-12 rounded mr-4 object-cover bg-gray-200 dark:bg-gray-700" 
              onError={(e) => { 
                console.error('Image failed to load:', item.image || item.product?.image);
                console.error('Attempted URL:', e.target.src);
                e.target.onerror = null; 
                e.target.src = 'https://placehold.co/48x48/e5e7eb/9ca3af?text=N/A';
              }} 
            />
          <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-900 dark:text-gray-100 truncate block">{item.name || item.product?.name}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</span>
      </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">${((item.price || item.product?.price) * item.quantity).toFixed(2)}</span>
        </li>
      ))}
    </ul>
  </div>
);
};

function Header({ cartItemCount }) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-md border-b border-gray-200 dark:border-gray-700/50 transition-colors duration-300 mb-6">
      <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Package className="h-8 w-auto text-emerald-600 dark:text-emerald-500" />
            <a href='/customer' className="ml-2 text-decoration-none text-xl font-bold text-gray-900 dark:text-gray-100">MDS Platform</a>
          </div>
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="relative p-2 text-gray-500 dark:text-gray-400">
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default function CheckoutPage() {
  const {
    formData,
    setFormData,
    handleSubmitOrder,
    cartItems,
    orderSuccess,
    orderError,
    errors,
  } = useCheckout();

  // Use an object for deliveryLocation
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [payPrice, setPayPrice] = useState('');
  useEffect(() => {
    setFormData(prev => ({ ...prev, deliveryLocation, payPrice }));
  }, [deliveryLocation, payPrice, setFormData]);

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header cartItemCount={cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} />
      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">Checkout</h1>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 max-w-xl mx-auto">
          {orderSuccess && (
            <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">Order placed successfully!</div>
          )}
          {orderError && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">{orderError}</div>
          )}
          <form onSubmit={handleSubmitOrder} noValidate className="space-y-7">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Delivery Location <span className="text-red-500">*</span>
              </label>
               <MapPicker
                value={deliveryLocation}
                onChange={loc => setDeliveryLocation(loc)}
              />
              {deliveryLocation && (
                <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                  <span>
                    Picked: {deliveryLocation.lat}, {deliveryLocation.lng} <br />
                    <a
                      href={`https://maps.google.com/?q=${deliveryLocation.lat},${deliveryLocation.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 underline"
                    >
                      View on Google Maps
                    </a>
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Please pick the delivery location on the map.
              </p>
               {errors.deliveryLocation && (
                <p className="mt-1 text-xs text-red-500">{errors.deliveryLocation}</p>
              )}
            </div>
            <div>
              <label htmlFor="payPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Amount</label>
              <input
                type="number"
                id="payPrice"
                name="payPrice"
                value={payPrice}
                onChange={e => setPayPrice(e.target.value)}
                min={0}
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2.5 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100"
                placeholder={`Enter payment amount (suggested: $${total.toFixed(2)})`}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Suggested: <span className="font-semibold text-emerald-600 dark:text-emerald-400">${total.toFixed(2)}</span></p>
            </div>
             <CartItemsSummary items={cartItems} />
            <div className="flex justify-between items-center text-lg font-semibold border-t pt-4 border-gray-200 dark:border-gray-700 mt-4">
              <span>Total Price:</span>
              <span className="text-emerald-700 dark:text-emerald-400">${total.toFixed(2)}</span>
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 transition-colors duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={cartItems.length === 0}
            >
              Place Order
            </button>
          </form>
        </div>
      </main>
    </div>
  )};