import React, { useState, useEffect } from 'react';
import { Home, Package, Users, LogIn, Menu, X, Sun, Moon, Info, Settings, Mail } from 'lucide-react'; // Added relevant icons
import ProductShowcase from '../components/Product/ProductShowcase';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';

// --- Theme Note ---
// Using Emerald theme (emerald-500 / dark:emerald-400 as primary accent)
// Ensure 'darkMode: "class"' is in your tailwind.config.js

// --- Main App Component (Handles Theme) ---
export default function App() {
  const [theme, setTheme] = useState('dark'); // Default theme

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => { setTheme(prev => (prev === 'dark' ? 'light' : 'dark')); };

  return <LandingPage theme={theme} toggleTheme={toggleTheme} />;
}

// --- Landing Page Component ---
function LandingPage({ theme, toggleTheme }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/customers/allProducts`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => {
        setProducts(Array.isArray(data) ? data : data.products || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Error fetching products');
        setLoading(false);
      });
  }, []);

  // Smooth scroll handler
  const handleScrollLink = (e, targetId) => {
      e.preventDefault();
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
          // Calculate offset if header is sticky (adjust '64' based on actual header height)
          const headerOffset = 64;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
          });
      }
      setIsMobileMenuOpen(false); // Close mobile menu on link click
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    // Base styles with theme transition
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-slate-800 font-sans antialiased transition-colors duration-300">
       {/* Global style for smooth scrolling */}
       <style jsx global>{` html { scroll-behavior: smooth; } `}</style>

      {/* Navigation Bar - Re-themed with Emerald */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200/50 dark:border-slate-700/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand Name */}
            <a href="#home" onClick={(e) => handleScrollLink(e, 'home')} className="flex-shrink-0 flex items-center cursor-pointer">
              <Package className="h-8 w-8 text-emerald-600 dark:text-emerald-400" /> {/* Emerald Accent */}
              <span className="text-xl font-bold text-gray-800 dark:text-gray-100 ml-2">MDS Platform</span>
            </a>

            {/* Desktop Navigation Links & Theme Toggle */}
            <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2">
              {/* Links updated for smooth scroll and Emerald theme */}
              {navLinks.map(link => (
                 <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => handleScrollLink(e, link.id)}
                    className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 focus:text-emerald-600 dark:focus:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out"
                 >
                    {link.label}
                 </a>
              ))}
              {/* Login Button - Re-themed */}
              <a href="/auth" // Link to separate auth page (assuming setup with router later)
                 className="ml-4 bg-emerald-500 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 flex items-center shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 ease-in-out">
                <LogIn className="h-4 w-4 mr-1.5" /> Login
              </a>
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="ml-2 p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-slate-900 focus:ring-emerald-500 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile Menu Button & Theme Toggle */}
            <div className="md:hidden flex items-center">
              <button onClick={toggleTheme} className="p-2 mr-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-slate-900 focus:ring-emerald-500 transition-colors" aria-label="Toggle theme">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition duration-150 ease-in-out" aria-expanded={isMobileMenuOpen}>
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
           <div className="md:hidden absolute top-16 inset-x-0 bg-white dark:bg-slate-800 shadow-lg z-40 border-t border-gray-200 dark:border-slate-700/50">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map(link => (
                 <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => handleScrollLink(e, link.id)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-700 dark:hover:text-emerald-400 focus:bg-emerald-100 dark:focus:bg-slate-700 focus:text-emerald-700 dark:focus:text-emerald-300 focus:outline-none transition duration-150 ease-in-out"
                 >
                    {link.label}
                 </a>
              ))}
              <a href="/auth" className="block w-full text-left px-3 py-3 mt-2 rounded-md text-base font-medium bg-emerald-500 text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 shadow hover:shadow-md transition duration-150 ease-in-out">
                Login / Sign Up
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Sections */}
      <main>
        {/* Hero Section */}
        <section id="home" className="relative pt-24 pb-36 flex content-center items-center justify-center min-h-[90vh]">
          <div className="absolute top-0 w-full h-full bg-center bg-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1604754742629-9e3d76133995?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80')" }}>
            <span id="blackOverlay" className="w-full h-full absolute opacity-70 bg-black"></span>
          </div>
          <div className="container relative mx-auto px-4">
            <div className="items-center flex flex-wrap">
              <div className="w-full lg:w-8/12 px-4 mx-auto text-center animate-fade-in-up">
                <div>
                  <h1 className="text-white font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight drop-shadow-lg">
                    Seamless Delivery, <span className="text-emerald-400">Simplified.</span> {/* Emerald Accent */}
                  </h1>
                  <p className="mt-4 text-lg lg:text-xl text-gray-200 drop-shadow-md max-w-3xl mx-auto">
                    Empowering merchants with fast, reliable, and trackable delivery solutions across Debre Markos. Focus on your business, we'll handle the logistics.
                  </p>
                  <div className="mt-12">
                    {/* Button Re-themed */}
                    <Link
                        to="/auth"
                      className="text-emerald-900 font-bold px-8 py-4 rounded-lg shadow-lg outline-none focus:outline-none mr-1 mb-1 bg-emerald-400 active:bg-emerald-500 uppercase text-sm hover:bg-emerald-300 hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Shape Divider */}
          <div className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-20" style={{ transform: "translateZ(0)" }}>
            <svg className="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" version="1.1" viewBox="0 0 2560 100" x="0" y="0">
              <polygon className="text-gray-100 dark:text-slate-800 fill-current transition-colors duration-300" points="2560 0 2560 100 0 100"></polygon>
            </svg>
          </div>
        </section>
        <div className="p-10">
        <h1 className="text-2xl md:text-3xl mb-10 font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 dark:from-emerald-500 dark:to-cyan-500">
                Discover Products
              </h1>
       {loading ? (
        <div className="text-center text-emerald-600 dark:text-emerald-400 py-4">Loading products...</div>
      ) : error ? (
        <div className="text-center text-red-600 dark:text-red-400 py-4">{error}</div>
      ) : (
        <ProductShowcase products={products} />
      )}
        </div>
       
      </main>

      {/* Footer - Re-themed & acts as Contact section target */}
      <footer id="contact" className="relative bg-gray-200 dark:bg-slate-800 pt-12 pb-8 transition-colors duration-300">
         <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 dark:bg-emerald-600"></div> {/* Emerald Accent */}
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap text-left lg:text-left">
            <div className="w-full lg:w-6/12 px-4 mb-8 lg:mb-0">
              <h4 className="text-3xl font-semibold text-gray-800 dark:text-white">MDS Platform</h4>
              <h5 className="text-lg mt-1 mb-2 text-gray-600 dark:text-gray-400">
                Connecting Debre Markos, one delivery at a time.
              </h5>
               <p className="text-sm text-gray-600 dark:text-gray-400 mt-4"> Have questions? Reach out to us!</p>
                <a href="mailto:support@mdsplatform.example.com" className="mt-2 inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium">
                    <Mail className="w-4 h-4 mr-2"/> support@mdsplatform.example.com {/* Replace Email */}
                </a>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="flex flex-wrap items-top mb-6">
                <div className="w-6/12 lg:w-4/12 px-4 ml-auto mb-6 lg:mb-0">
                  <span className="block uppercase text-gray-500 dark:text-gray-400 text-sm font-semibold mb-2">Useful Links</span>
                  <ul className="list-unstyled space-y-2">
                    <li><a className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold text-sm transition duration-150 ease-in-out" href="#about" onClick={(e)=>handleScrollLink(e, 'about')}>About Us</a></li>
                    <li><a className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold text-sm transition duration-150 ease-in-out" href="#">Blog</a></li>
                    <li><a className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold text-sm transition duration-150 ease-in-out" href="#">Careers</a></li>
                  </ul>
                </div>
                <div className="w-6/12 lg:w-4/12 px-4">
                  <span className="block uppercase text-gray-500 dark:text-gray-400 text-sm font-semibold mb-2">Other Resources</span>
                  <ul className="list-unstyled space-y-2">
                    <li><a className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold text-sm transition duration-150 ease-in-out" href="#">Terms & Conditions</a></li>
                    <li><a className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold text-sm transition duration-150 ease-in-out" href="#">Privacy Policy</a></li>
                    <li><a className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold text-sm transition duration-150 ease-in-out" href="#contact" onClick={(e)=>handleScrollLink(e, 'contact')}>Contact Us</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <hr className="my-6 border-gray-300 dark:border-slate-700" />
          <div className="flex flex-wrap items-center md:justify-between justify-center">
            <div className="w-full md:w-4/12 px-4 mx-auto text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold py-1">
                © {new Date().getFullYear()} MDS Platform - Debre Markos.
              </div>
            </div>
          </div>
        </div>
      </footer>

       {/* Add Animation Styles */}
       <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
}
