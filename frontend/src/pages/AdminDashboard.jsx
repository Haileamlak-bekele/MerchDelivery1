import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import {
  LayoutDashboard,
  Users,
  Truck,
  Settings,
  Bell,
  UserCircle,
  ChevronDown,
  Table,
  Package,
  Menu,
  X,
  Sun,
  Moon,
  Search,
  Plus,
  Download,
  Filter,
  Calendar,
  Clock,
  CreditCard,
  ShoppingCart,
  Box,
  Database,
  Server,
  Activity,
  AlertCircle
} from 'lucide-react';
import MerchantDetailModal from '../components/MerchantDetailModal';
import DSPDetailModal from '../components/DSPDetailModal';

import { useUsers } from '../hooks/useUsers';
import DeliveryPriceSection from '../components/DeliveryPriceSection';
import { fetchPlatformStats } from '../service/Service';
import { deleteUsers } from '../service/User';

// Main App component
export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved preference or system preference
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode !== null) return savedMode === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  return <AdminDashboard darkMode={darkMode} setDarkMode={setDarkMode} />;
}

// Admin Dashboard Component
function AdminDashboard({ darkMode, setDarkMode }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Sample data for charts
  const deliveryData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 900 },
  ];

  const userGrowthData = [
    { name: 'Jan', users: 100, merchants: 40 },
    { name: 'Feb', users: 200, merchants: 80 },
    { name: 'Mar', users: 300, merchants: 120 },
    { name: 'Apr', users: 400, merchants: 160 },
    { name: 'May', users: 500, merchants: 200 },
    { name: 'Jun', users: 600, merchants: 240 },
  ];

  const pieData = [
    { name: 'Completed', value: 75, color: 'bg-emerald-500' },
    { name: 'In Progress', value: 15, color: 'bg-blue-500' },
    { name: 'Pending', value: 10, color: 'bg-yellow-500' },
  ];

  // Sample notifications
  const notifications = [
    { id: 1, title: 'New order received', message: 'Order #1234 has been placed', time: '2 min ago', read: false },
    { id: 2, title: 'System update', message: 'Scheduled maintenance tonight', time: '1 hour ago', read: true },
    { id: 3, title: 'New user registered', message: 'John Doe joined the platform', time: '3 hours ago', read: true },
  ];

  // Function to render the content based on the active section
  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection deliveryData={deliveryData} userGrowthData={userGrowthData} pieData={pieData} />;
      case 'users':
        return <UsersSection />;
      case 'merchants':
        return <MerchantSection />;
      case 'dsp':
        return <DspSection />;
      case 'delivery-prices':
        return <DeliveryPriceSection />;
      case 'deliveries':
        return <DeliveriesSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <OverviewSection deliveryData={deliveryData} userGrowthData={userGrowthData} pieData={pieData} />;
    }
  };

  // Sidebar navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'merchants', label: 'Merchant', icon: Users },
    { id: 'dsp', label: 'DSP', icon: Users },
    { id: 'delivery-prices', label: 'Delivery Prices', icon: Users },
    { id: 'deliveries', label: 'Deliveries', icon: Truck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <aside className={`absolute md:relative z-30 flex-shrink-0 w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-lg md:shadow-none`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-emerald-500 mr-2" />
              <span className="text-xl font-bold text-gray-800 dark:text-white">MDS Admin</span>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 mt-4 px-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group ${
                  activeSection === item.id
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${
                  activeSection === item.id ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                }`} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserCircle className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Admin User</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-1 mr-4 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition duration-150"
              />
            </div>
          </div>

          {/* Right side icons/profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none relative"
              >
                <Bell className="h-6 w-6" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Notifications</p>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notification.read ? 'bg-emerald-50/50 dark:bg-emerald-900/20' : ''}`}
                      >
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{notification.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{notification.message}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-center">
                    <button className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <UserCircle className="h-6 w-6" />
                </div>
                <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300">Admin</span>
                <ChevronDown className="hidden md:inline h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-800 dark:text-white">Signed in as</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">admin@example.com</p>
                  </div>
                  <div className="py-1">
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Your Profile
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Settings
                    </a>
                  </div>
                  <div className="py-1 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {}}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <span className="capitalize">{activeSection}</span>
            <ChevronDown className="h-4 w-4 transform -rotate-90 mx-1" />
            <span className="text-gray-800 dark:text-gray-200 font-medium">Dashboard</span>
          </div>

          {/* Render the active section's content */}
          {renderSection()}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} MDS Admin. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// --- Section Components ---

// Overview Section Component
// eslint-disable-next-line no-unused-vars
function OverviewSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchPlatformStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const userGrowthData = [
    { name: 'Jan', users: stats.registeredUsers.monthly.find(item => item.month === 'January')?.count || 0 },
    { name: 'Feb', users: stats.registeredUsers.monthly.find(item => item.month === 'February')?.count || 0 },
    { name: 'Mar', users: stats.registeredUsers.monthly.find(item => item.month === 'March')?.count || 0 },
    { name: 'Apr', users: stats.registeredUsers.monthly.find(item => item.month === 'April')?.count || 0 },
    { name: 'May', users: stats.registeredUsers.monthly.find(item => item.month === 'May')?.count || 0 },
    { name: 'Jun', users: stats.registeredUsers.monthly.find(item => item.month === 'June')?.count || 0 },
    { name: 'Jul', users: stats.registeredUsers.monthly.find(item => item.month === 'July')?.count || 0 },
    { name: 'Aug', users: stats.registeredUsers.monthly.find(item => item.month === 'August')?.count || 0 },
    { name: 'Sep', users: stats.registeredUsers.monthly.find(item => item.month === 'September')?.count || 0 },
    { name: 'Oct', users: stats.registeredUsers.monthly.find(item => item.month === 'October')?.count || 0 },
    { name: 'Nov', users: stats.registeredUsers.monthly.find(item => item.month === 'November')?.count || 0 },
    { name: 'Dec', users: stats.registeredUsers.monthly.find(item => item.month === 'December')?.count || 0 },
  ];

  const { total, completed, inProgress, pending } = stats.orders;

  const completedPercentage = (completed / total) * 100;
  const inProgressPercentage = (inProgress / total) * 100;
  const pendingPercentage = (pending / total) * 100;

  const completedPercentageRounded = Math.round(completedPercentage * 100) / 100;
  const inProgressPercentageRounded = Math.round(inProgressPercentage * 100) / 100;
  const pendingPercentageRounded = Math.round(pendingPercentage * 100) / 100;

  const pieData = [
    { name: 'Completed', value: completedPercentageRounded },
    { name: 'In Progress', value: inProgressPercentageRounded },
    { name: 'Pending', value: pendingPercentageRounded },
  ];

  const COLORS = ['#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#8884D8'];

  // Define stats cards using fetched data
  const statsCards = [
    { name: 'Total Users', value: stats?.totalUsers || '0', icon: Users, change: '+12%', trend: 'up' },
    { name: 'Total Merchant', value: stats?.roles?.merchant || '0', icon: Users, change: '+5%', trend: 'up' },
    { name: 'Total Dsp', value: stats?.roles?.dsp, icon: Users, change: '+23%', trend: 'up' },
    { name: 'Total Orders', value: stats?.orders?.total, icon: Users, change: '+23%', trend: 'up' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                <div className={`flex items-center mt-2 ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                  <stat.icon className="h-4 w-4 mr-1" />
                  <span className="text-xs">{stat.change}</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500">
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Growth Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Growth</h3>
          <button className="text-sm px-3 py-1 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 flex items-center">
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delivery Status</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {pieData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



// Users Section Component
function UsersSection() {
  const { getFilteredUsers, setFilter, refresh } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2; // Number of items to display per page

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setFilter({ name: event.target.value, status: statusFilter === 'All' ? null : statusFilter });
    setCurrentPage(1); // Reset to the first page when search term changes
  };

  const handleStatusChange = (event) => {
    const status = event.target.value === 'All' ? null : event.target.value;
    setStatusFilter(event.target.value);
    setFilter({ name: searchTerm, status: status });
    setCurrentPage(1); // Reset to the first page when status filter changes
  };

  const handleDelete = async (id) => {
    try {
      await deleteUsers(id);
      refresh();
    } catch (error) {
      console.error("Failed to delete the user:", error);
    }
  };

  const users = getFilteredUsers();

  // Calculate the index of the first and last item to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = users.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate the total number of pages
  const totalPages = Math.ceil(users.length / itemsPerPage);

  // Function to handle page changes
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition duration-150"
            />
          </div>
          <div className="ml-4 flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Status:</span>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md bg-white dark:bg-gray-700"
            >
              <option>All</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Suspended</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentItems.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'Customer' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                      user.role === 'Merchant' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' :
                      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                      user.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDelete(user._id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, users.length)}</span> of <span className="font-medium">{users.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`px-3 py-1 border rounded-md ${currentPage === index + 1 ? 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// Deliveries Section Component
// Deliveries Section Component
function DeliveriesSection() {
  const deliveries = [
    { id: '#DL-1001', customer: 'John Doe', merchant: 'Fresh Groceries', status: 'Delivered', date: '2023-06-15', amount: '$24.50' },
    { id: '#DL-1002', customer: 'Jane Smith', merchant: 'Tech Gadgets', status: 'In Transit', date: '2023-06-15', amount: '$129.99' },
    { id: '#DL-1003', customer: 'Robert Johnson', merchant: 'Fashion Store', status: 'Processing', date: '2023-06-14', amount: '$59.99' },
    { id: '#DL-1004', customer: 'Emily Davis', merchant: 'Book Haven', status: 'Failed', date: '2023-06-14', amount: '$45.25' },
    { id: '#DL-1005', customer: 'Michael Wilson', merchant: 'Home Essentials', status: 'Delivered', date: '2023-06-13', amount: '$89.99' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Management</h2>
        <button className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Merchant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {deliveries.map((delivery) => (
              <tr key={delivery.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{delivery.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{delivery.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{delivery.merchant}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    delivery.status === 'Delivered' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                    delivery.status === 'In Transit' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                    delivery.status === 'Processing' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                  }`}>
                    {delivery.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{delivery.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">{delivery.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MerchantSection() {
  const { getFilteredMerchants, setFilter, refresh } = useUsers();
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items to display per page

  const openModal = (merchant) => {
    setSelectedMerchant(merchant);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMerchant(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteUsers(id);
      refresh(); // Refresh the list of merchants after deletion
    } catch (error) {
      console.error("Failed to delete the merchant:", error);
    }
  };

  const handleSearchChange = (event) => {
    setFilter({ name: event.target.value, status: null });
    setCurrentPage(1); // Reset to the first page when search term changes
  };

  const handleStatusChange = (event) => {
    const status = event.target.value === 'All' ? null : event.target.value;
    setFilter({ name: '', status: status });
    setCurrentPage(1); // Reset to the first page when status filter changes
  };

  const merchants = getFilteredMerchants();

  // Calculate the index of the first and last item to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = merchants.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate the total number of pages
  const totalPages = Math.ceil(merchants.length / itemsPerPage);

  // Function to handle page changes
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Merchant Management</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search Merchants..."
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition duration-150"
            />
          </div>
          <div className="ml-4 flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Status:</span>
            <select
              onChange={handleStatusChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md bg-white dark:bg-gray-700"
            >
              <option>All</option>
              <option>Approved</option>
              <option>pending</option>
              <option>Suspended</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Business Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentItems.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300">
                        {user.merchantDetails?.storeName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.merchantDetails?.storeName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.merchantDetails?.approvalStatus === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                      user.merchantDetails?.approvalStatus === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                    }`}>
                      {user.merchantDetails?.approvalStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openModal(user)}>View Details</button>
                    <button onClick={() => handleDelete(user._id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <MerchantDetailModal
            merchant={selectedMerchant}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, merchants.length)}</span> of <span className="font-medium">{merchants.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`px-3 py-1 border rounded-md ${currentPage === index + 1 ? 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DspSection() {
  const { getFilteredDsps, setFilter, refresh } = useUsers();
  const [selectedDsp, setSelectedDsp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items to display per page

  const openModal = (dsp) => {
    setSelectedDsp(dsp);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDsp(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteUsers(id);
      refresh(); // Refresh the list of DSPs after deletion
    } catch (error) {
      console.error("Failed to delete the DSP:", error);
    }
  };

  const handleSearchChange = (event) => {
    setFilter({ name: event.target.value, status: null });
    setCurrentPage(1); // Reset to the first page when search term changes
  };

  const handleStatusChange = (event) => {
    const status = event.target.value === 'All' ? null : event.target.value;
    setFilter({ name: '', status: status });
    setCurrentPage(1); // Reset to the first page when status filter changes
  };

  const dsps = getFilteredDsps();

  // Calculate the index of the first and last item to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dsps.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate the total number of pages
  const totalPages = Math.ceil(dsps.length / itemsPerPage);

  // Function to handle page changes
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">DSP Management</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search DSPs..."
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition duration-150"
            />
          </div>
          <div className="ml-4 flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Status:</span>
            <select
              onChange={handleStatusChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md bg-white dark:bg-gray-700"
            >
              <option>All</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Suspended</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Vehicle Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentItems.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300">
                        {user.DspDetails?.vehicleDetails.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.DspDetails?.vehicleDetails}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.DspDetails?.approvalStatus === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                      user.DspDetails?.approvalStatus === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                    }`}>
                      {user.DspDetails?.approvalStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openModal(user)}>View Details</button>
                    <button onClick={() => handleDelete(user._id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <DSPDetailModal
            merchant={selectedDsp}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, dsps.length)}</span> of <span className="font-medium">{dsps.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`px-3 py-1 border rounded-md ${currentPage === index + 1 ? 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}