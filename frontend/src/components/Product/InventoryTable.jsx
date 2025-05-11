import React from 'react';
import { Edit, Trash2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config';

function getImageUrl(imagePath, baseUrl = API_BASE_URL) {
  console.log('Original image path:', imagePath);
  console.log('Base URL:', baseUrl);
  
  if (!imagePath) {
    console.log('No image path provided, using placeholder');
    return 'https://placehold.co/60x60/7F848A/FFFFFF?text=N/A';
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

export default function InventoryTable({ items, onEdit, onDelete }) {
  const getStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'red', icon: XCircle };
    if (stock < 10) return { text: 'Low Stock', color: 'yellow', icon: AlertCircle };
    return { text: 'In Stock', color: 'green', icon: CheckCircle };
  };
  const statusColorClasses = {
    red: 'bg-red-500/10 text-red-400',
    yellow: 'bg-yellow-500/10 text-yellow-400 animate-pulse-fast',
    green: 'bg-green-500/10 text-green-400',
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700/30">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-6 py-3">Product Name</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr key="empty-state-row">
                <td colSpan="7" className="text-center py-10 text-gray-400">No items found.</td>
              </tr>
            ) : (
              items.map((item) => {
                const status = getStatus(item.stock_quantity);
                const itemKey = item.id || item._id || `item-${Math.random()}`;
                return (
                  <tr key={itemKey} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition duration-150 ease-in-out">
                    <td className="px-4 py-2">
                      {console.log('Rendering image for item:', item.name, 'Image path:', item.image)}
                      <img
                        src={getImageUrl(item.image)}
                        className="w-12 h-12 object-cover rounded-md border border-gray-600"
                        onError={(e) => {
                          console.error('Image failed to load:', item.image);
                          console.error('Attempted URL:', e.target.src);
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/60x60/7F848A/FFFFFF?text=Error';
                        }}
                        alt={item.name || 'Product'}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{item.name}</td>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4">${item.price?.toFixed(2)}</td>
                    <td className="px-6 py-4">{item.stock_quantity}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColorClasses[status.color]}`}>
                        <status.icon className="w-3 h-3 mr-1" />
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <button onClick={() => onEdit(item)} className="text-indigo-400 hover:text-indigo-300 mr-3" title="Edit Item">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(item.id || item._id)} className="text-red-400 hover:text-red-300" title="Delete Item">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
