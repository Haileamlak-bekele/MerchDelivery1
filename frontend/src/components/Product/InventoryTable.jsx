import React from 'react';
import { Edit, Trash2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config';

function getImageUrl(imagePath, baseUrl = API_BASE_URL) {
  if (!imagePath) {
    return 'https://placehold.co/60x60/7F848A/FFFFFF?text=N/A';
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

export default function InventoryTable({ items, onEdit, onDelete }) {
  const isLightMode = true; // Set to light mode by default

  const getStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'red', icon: XCircle };
    if (stock < 10) return { text: 'Low Stock', color: 'yellow', icon: AlertCircle };
    return { text: 'In Stock', color: 'green', icon: CheckCircle };
  };

  const statusColorClasses = {
    red: 'bg-red-200 text-red-600',
    yellow: 'bg-yellow-200 text-yellow-600 animate-pulse-fast',
    green: 'bg-green-200 text-green-600',
  };

  const tableClasses = 'bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden text-gray-700';
  const headerClasses = 'text-xs text-gray-600 uppercase bg-gray-100';
  const rowClasses = 'border-b border-gray-200 hover:bg-gray-100 transition duration-150 ease-in-out';

  return (
    <div className={tableClasses}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm text-left">
          <thead className={headerClasses}>
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
                  <tr key={itemKey} className={rowClasses}>
                    <td className="px-4 py-2">
                      <img
                        src={getImageUrl(item.image)}
                        className="w-12 h-12 object-cover rounded-md border border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/60x60/7F848A/FFFFFF?text=Error';
                        }}
                        alt={item.name || 'Product'}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium whitespace-nowrap">{item.name}</td>
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
                      <button onClick={() => onEdit(item)} className="text-green-500 hover:text-green-400 mr-3" title="Edit Item">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(item.id || item._id)} className="text-red-500 hover:text-red-400" title="Delete Item">
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
