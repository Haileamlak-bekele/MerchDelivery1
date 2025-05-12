import React, { useState, useEffect, useMemo } from 'react';
import { Package, PlusCircle, Search, Filter, Edit, Trash2, AlertCircle, CheckCircle, XCircle, X, Image as ImageIcon, DollarSign, Hash, List } from 'lucide-react';

// --- Mock Data ---
const mockInventory = [
  { id: 'inv-001', name: 'Wireless Headphones', category: 'Electronics', price: 199.99, stock: 50, imageUrl: 'https://placehold.co/100x100/000000/FFFFFF?text=Headphones', description: 'Noise-cancelling over-ear headphones.' },
  { id: 'inv-002', name: 'Cotton T-Shirt (M)', category: 'Clothing', price: 24.99, stock: 120, imageUrl: 'https://placehold.co/100x100/FFFFFF/000000?text=T-Shirt', description: 'Medium size white cotton t-shirt.' },
  { id: 'inv-003', name: 'Running Shoes (Sz 10)', category: 'Shoes', price: 89.95, stock: 8, imageUrl: 'https://placehold.co/100x100/0000FF/FFFFFF?text=Shoes', description: 'Size 10 blue running shoes.' },
  { id: 'inv-004', name: 'Smartphone Pro', category: 'Electronics', price: 799.00, stock: 25, imageUrl: 'https://placehold.co/100x100/C0C0C0/000000?text=Smartphone', description: 'Latest gen smartphone.' },
  { id: 'inv-005', name: 'Denim Jeans (32W)', category: 'Clothing', price: 59.99, stock: 0, imageUrl: 'https://placehold.co/100x100/0000FF/FFFFFF?text=Jeans', description: '32 Waist blue denim jeans.' },
  { id: 'inv-006', name: 'Leather Loafers (Sz 9)', category: 'Shoes', price: 120.00, stock: 15, imageUrl: 'https://placehold.co/100x100/000000/FFFFFF?text=Loafers', description: 'Size 9 black leather loafers.' },
  { id: 'inv-007', name: 'Bluetooth Speaker', category: 'Electronics', price: 49.99, stock: 4, imageUrl: 'https://placehold.co/100x100/808080/FFFFFF?text=Speaker', description: 'Portable Bluetooth speaker.' },
];

// --- Main App Component (for context) ---
export default function App() {
  // In a real app, InventoryPage would be rendered by a protected route
  return <InventoryPage />;
}

// --- Inventory Page Component ---
function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState(mockInventory);
  const [filteredItems, setFilteredItems] = useState(mockInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null); // null for Add, item object for Edit

  // Extract unique categories for filter dropdown
  const categories = useMemo(() => ['All', ...new Set(inventoryItems.map(item => item.category))], [inventoryItems]);

  // Filtering logic
  useEffect(() => {
    let tempItems = inventoryItems;

    // Filter by category
    if (activeCategoryFilter && activeCategoryFilter !== 'All') {
      tempItems = tempItems.filter(item => item.category === activeCategoryFilter);
    }

    // Filter by search term (name, category, description)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempItems = tempItems.filter(item =>
        item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.category.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.description.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    setFilteredItems(tempItems);
  }, [inventoryItems, searchTerm, activeCategoryFilter]);

  // --- CRUD Handlers (Placeholders) ---
  const handleAddItem = (newItemData) => {
    console.log("Adding item:", newItemData);
    const newItem = {
      ...newItemData,
      id: `inv-${Date.now()}`, // Simple temporary ID generation
    };
    setInventoryItems(prev => [newItem, ...prev]); // Add to top for visibility
    setIsModalOpen(false);
  };

  const handleEditItem = (editedItemData) => {
    console.log("Editing item:", editedItemData);
    setInventoryItems(prev =>
      prev.map(item => item.id === editedItemData.id ? { ...item, ...editedItemData } : item)
    );
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleDeleteItem = (itemId) => {
    console.log("Deleting item:", itemId);
    if (window.confirm(`Are you sure you want to delete item ${itemId}?`)) {
        setInventoryItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  // --- Modal Open/Close ---
  const openAddModal = () => {
    setCurrentItem(null); // Ensure it's an "add" operation
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setCurrentItem(item); // Set the item to be edited
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null); // Clear current item on close
  };

  // --- Calculate Stats (Example) ---
  const totalItems = inventoryItems.length;
  const lowStockItems = inventoryItems.filter(item => item.stock > 0 && item.stock < 10).length;
  const outOfStockItems = inventoryItems.filter(item => item.stock === 0).length;


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-gray-200 font-sans p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Package className="w-8 h-8 mr-3 text-indigo-400" />
            Inventory Management
          </h1>
          <button
            onClick={openAddModal}
            className="flex items-center px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-150 ease-in-out shadow-md hover:shadow-lg"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add New Item
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          <StatCard title="Total Items" value={totalItems} icon={List} color="blue" />
          <StatCard title="Low Stock" value={lowStockItems} icon={AlertCircle} color="yellow" />
          <StatCard title="Out of Stock" value={outOfStockItems} icon={XCircle} color="red" />
        </div>


        {/* Filter and Search Controls */}
        <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg flex flex-col md:flex-row gap-4 items-center">
           {/* Search Input */}
           <div className="relative flex-grow w-full md:w-auto">
              <input
                type="search"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition duration-150 ease-in-out"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {/* Category Filter */}
            <div className="relative flex-shrink-0 w-full md:w-auto">
                 <select
                    value={activeCategoryFilter}
                    onChange={(e) => setActiveCategoryFilter(e.target.value)}
                    className="w-full md:w-48 appearance-none pl-4 pr-10 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition duration-150 ease-in-out cursor-pointer"
                 >
                    {categories.map(cat => (
                        <option key={cat} value={cat} className="bg-gray-800 text-white">{cat}</option>
                    ))}
                 </select>
                 <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
        </div>

        {/* Inventory Table */}
        <InventoryTable
            items={filteredItems}
            onEdit={openEditModal}
            onDelete={handleDeleteItem}
        />

      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <ItemModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={currentItem ? handleEditItem : handleAddItem}
          itemData={currentItem} // Pass current item for editing, null for adding
          categories={[...new Set(inventoryItems.map(item => item.category))]} // Pass existing categories
        />
      )}
    </div>
  );
}

// --- Sub Components ---

// Stat Card Component
function StatCard({ title, value, icon: Icon, color }) {
    const colorClasses = {
        blue: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
        yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
        red: 'bg-red-500/10 border-red-500/30 text-red-300',
    };
    return (
        <div className={`p-5 bg-white/5 backdrop-blur-sm border ${colorClasses[color]} rounded-lg shadow-md flex items-center justify-between`}>
            <div>
                <p className="text-sm font-medium text-gray-400 uppercase">{title}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${colorClasses[color].split(' ')[0]}`}>
                 <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[2]}`} />
            </div>
        </div>
    );
}


// Inventory Table Component
function InventoryTable({ items, onEdit, onDelete }) {

    const getStatus = (stock) => {
        if (stock === 0) return { text: 'Out of Stock', color: 'red', icon: XCircle };
        if (stock < 10) return { text: 'Low Stock', color: 'yellow', icon: AlertCircle };
        return { text: 'In Stock', color: 'green', icon: CheckCircle };
    };

    const statusColorClasses = {
        red: 'bg-red-500/10 text-red-400',
        yellow: 'bg-yellow-500/10 text-yellow-400 animate-pulse-fast', // Added pulse for low stock
        green: 'bg-green-500/10 text-green-400',
    };

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/30">
                        <tr>
                            <th scope="col" className="px-4 py-3">Image</th>
                            <th scope="col" className="px-6 py-3">Product Name</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Price</th>
                            <th scope="col" className="px-6 py-3">Stock</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-10 text-gray-400">No items found.</td>
                            </tr>
                        ) : (
                            items.map((item) => {
                                const status = getStatus(item.stock);
                                return (
                                    <tr key={item.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition duration-150 ease-in-out">
                                        <td className="px-4 py-2">
                                            <img
                                                src={item.imageUrl || 'https://placehold.co/60x60/7F848A/FFFFFF?text=N/A'}
                                                alt={item.name}
                                                className="w-12 h-12 object-cover rounded-md border border-gray-600"
                                                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/60x60/7F848A/FFFFFF?text=Error'; }}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{item.name}</td>
                                        <td className="px-6 py-4">{item.category}</td>
                                        <td className="px-6 py-4">${item.price.toFixed(2)}</td>
                                        <td className="px-6 py-4">{item.stock}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColorClasses[status.color]}`}>
                                                <status.icon className="w-3 h-3 mr-1" />
                                                {status.text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <button onClick={() => onEdit(item)} className="text-indigo-400 hover:text-indigo-300 mr-3 transition duration-150 ease-in-out" title="Edit Item">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-300 transition duration-150 ease-in-out" title="Delete Item">
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
             {/* Add Pagination Placeholder if needed */}
             {/* <div className="p-4 text-center text-xs text-gray-500">Pagination Controls Placeholder</div> */}
        </div>
    );
}


// Add/Edit Item Modal Component
function ItemModal({ isOpen, onClose, onSave, itemData, categories }) {
  const [formData, setFormData] = useState({
    name: '',
    category: categories[0] || '', // Default to first category or empty
    price: '',
    stock: '',
    imageUrl: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Populate form if itemData is provided (for editing)
  useEffect(() => {
    if (itemData) {
      setFormData({
        id: itemData.id, // Keep ID for editing
        name: itemData.name || '',
        category: itemData.category || (categories[0] || ''),
        price: itemData.price || '',
        stock: itemData.stock || '',
        imageUrl: itemData.imageUrl || '',
        description: itemData.description || '',
      });
    } else {
      // Reset form for adding
      setFormData({
        name: '', category: categories[0] || '', price: '', stock: '', imageUrl: '', description: '',
      });
    }
    setFormErrors({}); // Clear errors when modal opens or item changes
  }, [itemData, isOpen, categories]); // Rerun effect when modal opens or item changes

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || '' : value, // Handle number inputs
    }));
     // Clear specific error on change
     if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
      const errors = {};
      if (!formData.name.trim()) errors.name = "Product name is required.";
      if (!formData.category) errors.category = "Category is required.";
      if (formData.price === '' || formData.price < 0) errors.price = "Valid price is required.";
      if (formData.stock === '' || formData.stock < 0 || !Number.isInteger(Number(formData.stock))) errors.stock = "Valid stock quantity (integer) is required.";
      // Basic URL validation (optional but good)
      if (formData.imageUrl && !/^https?:\/\/.+\..+/.test(formData.imageUrl)) errors.imageUrl = "Please enter a valid image URL (starting with http/https).";

      setFormErrors(errors);
      return Object.keys(errors).length === 0; // Return true if no errors
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
        onSave(formData); // Pass the form data to the save handler
    }
  };

  if (!isOpen) return null;

  return (
    // Modal backdrop
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out animate-fade-in">
      {/* Modal content */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">
            {itemData ? 'Edit Item' : 'Add New Item'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-300">Product Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={`w-full px-3 py-2 bg-gray-700 border ${formErrors.name ? 'border-red-500' : 'border-gray-600'} rounded-md text-white focus:outline-none focus:ring-1 focus:ring-indigo-500`} />
            {formErrors.name && <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block mb-1 text-sm font-medium text-gray-300">Category</label>
            <select name="category" id="category" value={formData.category} onChange={handleChange} required className={`w-full px-3 py-2 bg-gray-700 border ${formErrors.category ? 'border-red-500' : 'border-gray-600'} rounded-md text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer`}>
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-gray-800">{cat}</option>
              ))}
               {/* Option to add a new category (more complex implementation needed) */}
               {/* <option value="add_new">-- Add New Category --</option> */}
            </select>
             {formErrors.category && <p className="text-xs text-red-400 mt-1">{formErrors.category}</p>}
          </div>

          {/* Price & Stock (Inline) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block mb-1 text-sm font-medium text-gray-300">Price ($)</label>
              <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className={`w-full px-3 py-2 bg-gray-700 border ${formErrors.price ? 'border-red-500' : 'border-gray-600'} rounded-md text-white focus:outline-none focus:ring-1 focus:ring-indigo-500`} />
              {formErrors.price && <p className="text-xs text-red-400 mt-1">{formErrors.price}</p>}
            </div>
             <div>
              <label htmlFor="stock" className="block mb-1 text-sm font-medium text-gray-300">Stock Quantity</label>
              <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} required min="0" step="1" className={`w-full px-3 py-2 bg-gray-700 border ${formErrors.stock ? 'border-red-500' : 'border-gray-600'} rounded-md text-white focus:outline-none focus:ring-1 focus:ring-indigo-500`} />
               {formErrors.stock && <p className="text-xs text-red-400 mt-1">{formErrors.stock}</p>}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="imageUrl" className="block mb-1 text-sm font-medium text-gray-300">Image URL (Optional)</label>
            <input type="url" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." className={`w-full px-3 py-2 bg-gray-700 border ${formErrors.imageUrl ? 'border-red-500' : 'border-gray-600'} rounded-md text-white focus:outline-none focus:ring-1 focus:ring-indigo-500`} />
             {formErrors.imageUrl && <p className="text-xs text-red-400 mt-1">{formErrors.imageUrl}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-300">Description (Optional)</label>
            <textarea name="description" id="description" rows="3" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"></textarea>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end items-center pt-4 border-t border-gray-700 mt-2 space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-600 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-150 ease-in-out">
              {itemData ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
       {/* Simple CSS Animation for Modal */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
        @keyframes pulse-fast {
          0%, 100% { opacity: 0.7; } 50% { opacity: 1; }
        }
        .animate-pulse-fast { animation: pulse-fast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
}

