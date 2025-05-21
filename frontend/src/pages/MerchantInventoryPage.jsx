import React, { useState } from 'react';
import { Package, PlusCircle, Search, Filter, List, AlertCircle, XCircle, X, Menu } from 'lucide-react';
import StatCard from '../components/Product/StatCard';
import InventoryTable from '../components/Product/InventoryTable';
import ItemModal from '../components/Product/ItemModal';
import { useProduct } from '../hooks/useProduct';
import Sidebar from '../components/Sidebar';

export default function MerchantInventoryPage() {
  const product = useProduct();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('inventory');

  // Dummy logout handler
  const handleLogout = () => {
    // Implement logout logic here
    alert('Logged out!');
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-gray-200 font-sans">
      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleLogout={handleLogout}
      />
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center mb-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 mr-2"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Package className="w-7 h-7 mr-2 text-indigo-400" />
            Inventory Management
          </h1>
        </div>
          <div className="max-w-7xl mx-auto">
          {/* Header (hidden on mobile) */}
          <div className="hidden md:flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Package className="w-8 h-8 mr-3 text-indigo-400" />
            Inventory Management
          </h1>
          <button
            onClick={() => { product.setCurrentProduct(null); product.setIsModalOpen(true); }}
            className="flex items-center px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add New Item
          </button>
        </div>
        {/* Loading */}
        {product.isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
        {/* Error */}
        {product.error && !product.isLoading && (
          <div className="p-4 mb-6 bg-red-900/30 border border-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-3 text-red-400" />
            <span>{product.error}</span>
            <button onClick={() => product.setError(null)} className="ml-auto p-1 text-red-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {/* Content */}
        {!product.isLoading && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
              <StatCard title="Total Items" value={product.totalProducts} icon={List} color="blue" />
              <StatCard title="Low Stock" value={product.lowStockProducts} icon={AlertCircle} color="yellow" />
              <StatCard title="Out of Stock" value={product.outOfStockProducts} icon={XCircle} color="red" />
            </div>
            {/* Filter/Search */}
            <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-grow w-full md:w-auto">
                <input
                  type="search"
                  placeholder="Search inventory..."
                  value={product.searchTerm}
                  onChange={e => product.setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <div className="relative flex-shrink-0 w-full md:w-auto">
                <select
                  value={product.activeCategory}
                  onChange={e => product.setActiveCategory(e.target.value)}
                  className="w-full md:w-48 appearance-none pl-4 pr-10 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white"
                >
                  {product.categories.map((cat, index) => (
                    <option key={`${cat}-${index}`} value={cat} className="bg-gray-800 text-white">{cat}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            {/* Table */}
            <InventoryTable
              items={product.filteredProducts}
              onEdit={item => { product.setCurrentProduct(item); product.setIsModalOpen(true); }}
              onDelete={product.handleDeleteProduct}
            />
          </>
        )}
        {/* Modal */}
        {product.isModalOpen && (
          <ItemModal
            isOpen={product.isModalOpen}
            onClose={() => { product.setIsModalOpen(false); product.setCurrentProduct(null); }}
            onSave={product.currentProduct ? product.handleEditProduct : product.handleAddProduct}
            itemData={product.currentProduct}
            categories={product.categories.filter(cat => cat == 'All')}
          />
        )}
        </div>
      </div>
    </div>
  );
}
