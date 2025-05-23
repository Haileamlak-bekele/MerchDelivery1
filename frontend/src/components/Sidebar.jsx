import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, UserCircle, LogOut, ArrowLeft } from 'lucide-react';

function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = [
    { id: 'inventory', label: 'Inventory', icon: Package, to: '/merchant' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, to: '/orders' },
    { id: 'profile', label: 'Profile', icon: UserCircle, to: '/profile' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/auth');
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 md:z-10 w-64 bg-gray-800/70 backdrop-blur-md border-r border-gray-700/50 p-6 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}
      >
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Package className="w-7 h-7 mr-2 text-indigo-400" />
            Merchant
          </h2>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <ArrowLeft size={20} />
          </button>
        </div>
        <nav className="flex-grow">
          <ul>
            {navItems.map((item) => {
              const isActive = location.pathname === item.to || (item.id === 'inventory' && location.pathname === '/merchant');
              return (
                <li key={item.id} className="mb-3">
                  <Link
                    to={item.to}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-150 ease-in-out
                      ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors duration-150 ease-in-out"
          >
            <LogOut className="w-5 h-5 mr-3 text-indigo-400" />
            <span className="font-medium">Logout</span>
          </button>
          <p className="text-xs text-gray-500 text-center mt-4">&copy; {new Date().getFullYear()} Merchant Portal</p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar; 