import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Package, ShoppingCart, UserCircle, LogOut, ArrowLeft } from 'lucide-react';

export default function MerchantLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('inventory');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNavClick = (viewId) => {
    setActiveView(viewId);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/70 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="hidden md:flex items-center">
                <Package className="h-8 w-8 text-indigo-400 mr-3" />
                <h1 className="text-xl font-bold text-white">Merchant Portal</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-md transition duration-150 ease-in-out"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 md:z-10 w-64 bg-gray-800/70 backdrop-blur-md border-r border-gray-700/50 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Package className="w-7 h-7 mr-2 text-indigo-400" />
            Merchant
          </h2>
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleNavClick('inventory')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-150 ease-in-out ${
                  activeView === 'inventory'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <Package className={`w-5 h-5 mr-3 ${activeView === 'inventory' ? 'text-white' : 'text-indigo-400'}`} />
                <span className="font-medium">Inventory</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('orders')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-150 ease-in-out ${
                  activeView === 'orders'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <ShoppingCart className={`w-5 h-5 mr-3 ${activeView === 'orders' ? 'text-white' : 'text-indigo-400'}`} />
                <span className="font-medium">Orders</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('profile')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-150 ease-in-out ${
                  activeView === 'profile'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <UserCircle className={`w-5 h-5 mr-3 ${activeView === 'profile' ? 'text-white' : 'text-indigo-400'}`} />
                <span className="font-medium">Profile</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors duration-150 ease-in-out"
          >
            <LogOut className="w-5 h-5 mr-3 text-indigo-400" />
            <span className="font-medium">Logout</span>
          </button>
          <p className="text-xs text-gray-500 text-center mt-4">
            &copy; {new Date().getFullYear()} Merchant Portal
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
} 