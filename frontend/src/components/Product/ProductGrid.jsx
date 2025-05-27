import React, { useState } from 'react';
import { ShoppingCart, Heart, Star, X } from 'lucide-react';
import { API_BASE_URL } from '../../config';

// Helper to render rating stars
function renderRatingStars(rating) {
  const stars = [];
  const fullStars = Math.floor(rating);
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 dark:text-yellow-500 fill-current" />);
  }
  for (let i = 0; i < 5 - fullStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600" />);
  }
  return <div className="flex items-center">{stars}</div>;
}

// Helper to get image URL
function getImageUrl(imagePath, baseUrl = API_BASE_URL) {
  if (!imagePath) {
    return 'https://placehold.co/300x192/f3f4f6/9ca3af?text=N/A';
  }
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  if (imagePath.startsWith('/uploads')) {
    return `${baseUrl}${imagePath}`;
  }
  let normalizedPath = imagePath
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')
    .replace(/^[/.]+/, '')
    .replace(/^uploads/, '/uploads')
    .replace(/^\/?/, '/');
  return `${baseUrl}${normalizedPath}`;
}

function ProductCard({ product, onSelect, onSaveToggle, isSaved, onAddToCart }) {
  const [isAnimatingHeart, setIsAnimatingHeart] = useState(false);
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  const handleHeartClick = (e) => {
    e.stopPropagation();
    onSaveToggle(product.id);
    setIsAnimatingHeart(true);
    setTimeout(() => setIsAnimatingHeart(false), 300);
  };

  const handleCartClick = (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowLoginMessage(true);
      setTimeout(() => setShowLoginMessage(false), 2000);
      return;
    }
    onAddToCart(product);
  };

  return (
    <div className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-md overflow-hidden hover:shadow-lg dark:hover:shadow-emerald-900/40 transition-all duration-300 ease-in-out group flex flex-col border border-gray-200 dark:border-gray-700/50 hover:border-emerald-300 dark:hover:border-emerald-700/50">
      <div className="relative">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="w-full h-48 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
          onClick={() => onSelect(product)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/400x400/f3f4f6/9ca3af?text=Not+Found';
          }}
        />
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
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-500">${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}</p>
          {renderRatingStars(product.rating)}
        </div>
        <button
          onClick={handleCartClick}
          className="w-full mt-auto px-4 py-2 bg-gray-100 dark:bg-gray-700/80 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 transition-all duration-300 ease-in-out flex items-center justify-center space-x-1 group/button hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] dark:hover:shadow-[0_0_15px_rgba(16,185,129,0.6)] focus:shadow-[0_0_15px_rgba(16,185,129,0.6)]"
        >
          <ShoppingCart className="w-4 h-4 transition-colors duration-300" />
          <span className="transition-colors duration-300">Add to Cart</span>
        </button>
        {showLoginMessage && (
          <div className="mt-2 text-xs text-red-500 text-center animate-pulse">Please login first to add items to cart.</div>
        )}
      </div>
      <style jsx global>{`
        @keyframes heartPop { 0% { transform: scale(1); } 50% { transform: scale(1.4); } 100% { transform: scale(1); } }
        .animate-heart-pop { animation: heartPop 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}

export default function ProductGrid({ products, onProductSelect, onSaveToggle, savedItems, onAddToCart }) {
  const [modalProduct, setModalProduct] = useState(null);

  const handleCardSelect = (product) => {
    setModalProduct(product);
    if (onProductSelect) onProductSelect(product);
  };
  const closeModal = () => setModalProduct(null);

  if (!products || products.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 mt-10">No products found matching your criteria.</p>;
  }
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={handleCardSelect}
            onSaveToggle={onSaveToggle}
            isSaved={savedItems.has(product.id)}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
      {modalProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300"
          style={{
            background: 'rgba(16, 24, 40, 0.65)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            animation: 'fadeInOverlay 0.3s',
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-0 relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-emerald-600 dark:bg-emerald-800">
              <h3 className="text-lg font-bold text-white">Product Details</h3>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              <img
                src={getImageUrl(modalProduct.image)}
                alt={modalProduct.name}
                className="w-48 h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700 mb-2"
                onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400/f3f4f6/9ca3af?text=Not+Found'; }}
              />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{modalProduct.name}</h2>
              <p className="text-md text-emerald-700 dark:text-emerald-400 font-semibold mb-1">${typeof modalProduct.price === 'number' ? modalProduct.price.toFixed(2) : '0.00'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Category: {modalProduct.category}</p>
              <div className="mb-2">{renderRatingStars(modalProduct.rating)}</div>
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">{modalProduct.description || 'No description available.'}</p>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes heartPop { 0% { transform: scale(1); } 50% { transform: scale(1.4); } 100% { transform: scale(1); } }
        .animate-heart-pop { animation: heartPop 0.3s ease-in-out; }
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
} 