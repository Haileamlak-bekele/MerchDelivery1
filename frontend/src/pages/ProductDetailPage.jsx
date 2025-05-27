// ProductDetailPage.js
import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiChevronRight } from 'react-icons/fi';
import { useProductDetail } from '../hooks/useProductDetail';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';
import { useCustomerShop } from '../hooks/useCustomerShop';



const ProductDetailPage = () => {
  const { productId } = useParams();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  console.log('User from localStorage:', user);
   const userID =user._id;
   const Name = user.name;
   const userName = user.name;
  const {
    product,
    comments,
    newComment,
    relatedProducts,
    rating,
    loading,
    error,
    selectedImage,
    quantity,
    selectedVariant,
    wishlisted,
    setNewComment,
    setRating,
    setSelectedImage,
    setQuantity,
    setSelectedVariant,
    setWishlisted,
    handleCommentSubmit,
    handleQuantityChange,
    calculateAverageRating
  } = useProductDetail(productId,userID,Name);

 const { products, addToCart,} = useCustomerShop();

  const handleAddToCart = useCallback((productToAdd) => {
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

    alert("product added to cart successfully");
  }, [addToCart, products]); 

 const handleCartClick = (e) => {
    e.stopPropagation();
    console.log('Add to Cart button clicked (id):', product._id || product.id);
    handleAddToCart(product);
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
  
  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );



  if (!product) return (
    <div className="text-center py-20">
      <div className="text-2xl font-bold mb-4">Product Not Found</div>
      <button
        onClick={() => window.history.back()}
        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
      >
        Go Back
      </button>
    </div>
  );



  return (

    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
    <div className="flex items-center text-sm text-gray-500 mb-6">
      <Link to="/customer" className="hover:text-emerald-600 cursor-pointer">
       Back to Home
      </Link>
    
      </div>

        {/* Product Main Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Product Images */}
            <div className="md:w-1/2 p-6">
              <div className="sticky top-6">
                <div className="h-96 w-full bg-gray-100 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 p-6 border-t md:border-t-0 md:border-l border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`${star <= calculateAverageRating() ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      {comments.length} {comments.length === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setWishlisted(!wishlisted)}
                  className={`p-2 rounded-full ${wishlisted ? 'text-red-500' : 'text-gray-400'}`}
                >
                  <FiHeart className={`w-6 h-6 ${wishlisted ? 'fill-red-500' : ''}`} />
                </button>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-emerald-600">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="ml-2 text-lg text-gray-500 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                {product.discount && (
                  <span className="ml-2 bg-emerald-100 text-emerald-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              <div className="mb-6">
                <p className="text-gray-700">{product.description}</p>
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Options</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 border rounded-md text-sm font-medium ${selectedVariant?.id === variant.id ? 'bg-emerald-100 border-emerald-500 text-emerald-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity</h3>
                <div className="flex items-center">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <div className="w-12 h-10 flex items-center justify-center border-t border-b border-gray-300 bg-white text-gray-900">
                    {quantity}
                  </div>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                onClick={handleCartClick}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm flex items-center justify-center transition">
                  <FiShoppingCart className="mr-2" />
                  Add to Cart
                </button>

              </div>

              {/* Product Details */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Details</h3>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li className="flex">
                    <span className="w-24 font-medium text-gray-700">Category</span>
                    <span>{product.category}</span>
                  </li>
                  <li className="flex">
                    <span className="w-24 font-medium text-gray-700">Brand</span>
                    <span>{product.brand || 'Unknown'}</span>
                  </li>
                  <li className="flex">
                    <span className="w-24 font-medium text-gray-700">Stock</span>
                    <span className={`${product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

          {/* Review Summary */}
          <div className="flex items-center mb-8">
            <div className="text-5xl font-bold mr-6">{calculateAverageRating()}</div>
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <span className="w-12 text-sm text-gray-500">5 star</span>
                <div className="flex-1 mx-2 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${(comments.filter(c => c.rating === 5).length / comments.length) * 100 || 0}%` }}
                  ></div>
                </div>
                <span className="w-8 text-sm text-gray-500">{comments.filter(c => c.rating === 5).length}</span>
              </div>
              {/* Repeat for 4, 3, 2, 1 stars */}
            </div>
          </div>

          {/* Reviews List */ console.log(comments)}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`${star <= comment.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} w-4 h-4`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{comment.createdAt}</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{comment.userName}</h4>
                  <p className="text-gray-700">{comment.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Review Form */}
          <div className="mt-10">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h3>
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    >
                      <FiStar />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                <textarea
                  id="comment"
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Share your thoughts about this product..."
                />
              </div>
              <button
                type="submit"
                disabled={!newComment.trim() || rating === 0}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
