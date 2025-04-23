import React, { useState, useEffect } from 'react';
// Ensure you have installed lucide-react: npm install lucide-react or yarn add lucide-react
import { User, Lock, Mail, Phone as PhoneIcon, Briefcase, MapPin, Truck, FileText, LogIn, UserPlus, Eye, EyeOff, Package, Sun, Moon, ArrowLeft } from 'lucide-react'; // Added ArrowLeft

// --- Constants ---
const ROLES = {
    CUSTOMER: 'customer',
    MERCHANT: 'merchant',
    DSP: 'dsp', // Delivery Service Provider
};

// --- Main App Component ---
// This component wraps the AuthPage and includes a theme toggler for standalone preview.
// In a real application, theme management and routing would likely be handled globally.
// IMPORTANT: This App component needs to be rendered into the DOM using ReactDOM in your project's entry point (e.g., main.jsx or index.js).
// Example entry point code:
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App'; // Assuming this file is App.jsx
// import './index.css'; // Your Tailwind CSS import
// ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
export default function App() {
    // Theme state logic (reads from localStorage or system preference)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('authPageTheme'); // Use a unique key for this example
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // Effect to apply the 'dark' class to the <html> element
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('authPageTheme', 'dark'); // Save preference
        } else {
            root.classList.remove('dark');
            localStorage.setItem('authPageTheme', 'light'); // Save preference
        }
    }, [isDarkMode]);

     // Effect to listen for system theme changes (optional, but good practice)
     useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            // Only update if no theme is explicitly saved in localStorage
             if (!localStorage.getItem('authPageTheme')) {
                setIsDarkMode(e.matches);
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);


    return (
        // Wrapper div for centering and background styling
        <div className={`min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 transition-colors duration-300 font-sans`}>
             {/* Theme Toggle Button (useful for testing/preview) */}
             <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Toggle Theme"
            >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {/* Render the actual Authentication Page */}
            <AuthPage />
        </div>
    );
}


// --- Authentication Page Component ---
// This component contains the logic for the Login/Sign Up form.
export function AuthPage() {
    // State declarations
    const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', or 'forgotPassword'
    const [selectedRole, setSelectedRole] = useState(ROLES.CUSTOMER);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '',
        businessName: '', documentation: null, locationLink: '',
        vehicleType: '', plateNumber: '', drivingLicense: null,
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // --- Helper: Reset Form State ---
    const resetFormState = (mode = 'login', role = ROLES.CUSTOMER) => {
         setFormData({
            name: '', email: '', phone: '', password: '', confirmPassword: '',
            businessName: '', documentation: null, locationLink: '',
            vehicleType: '', plateNumber: '', drivingLicense: null,
        });
        setSelectedRole(role);
        setErrors({});
        setShowPassword(false);
        setShowConfirmPassword(false);
        setAuthMode(mode);
    };


    // --- Event Handlers ---

    // Handles changes in form inputs (text, email, tel, file, etc.)
    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        const inputValue = type === 'file' ? files[0] : value;
        setFormData(prev => ({ ...prev, [name]: inputValue }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
        if (name === 'password' && errors.confirmPassword) {
             setErrors(prev => ({ ...prev, confirmPassword: null }));
        }
    };

    // Handles selection of user role during sign up
    const handleRoleChange = (e) => {
        const newRole = e.target.value;
        setSelectedRole(newRole);
        // Reset only role-specific fields, keep common ones
        setFormData(prev => ({
            ...prev,
            businessName: '', documentation: null, locationLink: '',
            vehicleType: '', plateNumber: '', drivingLicense: null,
        }));
        // Clear only role-specific errors
        // eslint-disable-next-line no-unused-vars
        const { businessName, documentation, locationLink, vehicleType, plateNumber, drivingLicense, ...commonErrors } = errors;
        setErrors(commonErrors);
    };

    // Toggles the view between Login and Sign Up modes
    const toggleMode = () => {
        const nextMode = authMode === 'login' ? 'signup' : 'login';
        resetFormState(nextMode);
    };

    // Switch to Forgot Password mode
    const handleForgotPasswordClick = () => {
        resetFormState('forgotPassword');
    };

     // Switch back to Login mode from Forgot Password
    const handleBackToLoginClick = () => {
        resetFormState('login');
    };


    // --- Validation ---
    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (authMode === 'signup') {
            // Common validation (same as before)
            if (!formData.name.trim()) newErrors.name = 'Name is required';
            if (!formData.email.trim()) newErrors.email = 'Email is required';
            else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
            if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
            else if (!/^\d{9,}$/.test(formData.phone)) newErrors.phone = 'Phone number must be at least 9 digits'; // Example length check
            if (!formData.password) newErrors.password = 'Password is required';
            else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
            if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
            else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

            // Role-specific validation (same as before)
            if (selectedRole === ROLES.MERCHANT) {
                if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
                if (!formData.documentation) newErrors.documentation = 'Documentation upload is required';
                if (!formData.locationLink.trim()) newErrors.locationLink = 'Location link is required';
            } else if (selectedRole === ROLES.DSP) {
                if (!formData.vehicleType.trim()) newErrors.vehicleType = 'Vehicle type is required';
                if (!formData.plateNumber.trim()) newErrors.plateNumber = 'Plate number is required';
                if (!formData.drivingLicense) newErrors.drivingLicense = 'Driving license upload is required';
            }
        } else if (authMode === 'login') { // Login validation
            if (!formData.email.trim()) newErrors.email = 'Email is required';
            else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
            if (!formData.password) newErrors.password = 'Password is required';
        } else if (authMode === 'forgotPassword') { // Forgot Password validation
             if (!formData.email.trim()) newErrors.email = 'Email is required';
            else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- Form Submission ---

    // Handles login submission
    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            console.log("Login Data:", { email: formData.email });
            alert('Login Submitted! Check console.');
        } else {
             console.log("Login validation failed:", errors);
        }
    };

    // Handles sign up submission
    const handleSignupSubmit = (e) => {
        e.preventDefault();
         if (validateForm()) {
             const signupData = { ...formData, role: selectedRole };
             delete signupData.confirmPassword;
             const logData = { ...signupData };
             delete logData.password; // Don't log password
             console.log("Sign Up Data:", logData);
             alert('Sign Up Submitted! Check console.');
         } else {
             console.log("Signup validation failed:", errors);
         }
    };

    // Handles forgot password submission
    const handleForgotPasswordSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            console.log("Forgot Password Request:", { email: formData.email });
            // TODO: Replace with actual API call
            alert('Password recovery link sent (simulation)! Check console.');
            // Optionally switch back to login after submission
            // handleBackToLoginClick();
        } else {
            console.log("Forgot password validation failed:", errors);
        }
    };


    // --- Render Helper Functions ---

    // Renders a standard input field
    const renderInputField = (name, type, placeholder, Icon, isRequired = true, error = null) => (
        <div className="relative mb-4"> {/* Reduced bottom margin */}
            <label htmlFor={name} className="sr-only">{placeholder}</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
                type={type}
                id={name}
                name={name}
                value={formData[name] || ''}
                onChange={handleInputChange}
                required={isRequired}
                placeholder={placeholder}
                className={`relative w-full pl-10 pr-3 py-2.5 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-150 ease-in-out ${error ? 'border-red-500 dark:border-red-600 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                aria-invalid={!!error}
                aria-describedby={error ? `${name}-error` : undefined}
            />
            {error && <p id={`${name}-error`} className="mt-1 text-xs text-red-600 dark:text-red-500">{error}</p>}
        </div>
    );

    // Renders a password input field
     const renderPasswordField = (name, placeholder, show, setShow, error = null) => (
        <div className="relative mb-4"> {/* Reduced bottom margin */}
            <label htmlFor={name} className="sr-only">{placeholder}</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
                type={show ? 'text' : 'password'}
                id={name}
                name={name}
                value={formData[name] || ''}
                onChange={handleInputChange}
                required
                placeholder={placeholder}
                className={`relative w-full pl-10 pr-10 py-2.5 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-150 ease-in-out ${error ? 'border-red-500 dark:border-red-600 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                aria-invalid={!!error}
                aria-describedby={error ? `${name}-error` : undefined}
            />
            {/* Updated Eye Icon Button Styling */}
            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 m-1 z-10" // Added padding, margin, subtle hover bg
                aria-label={show ? "Hide password" : "Show password"}
            >
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
             {error && <p id={`${name}-error`} className="mt-1 text-xs text-red-600 dark:text-red-500">{error}</p>}
        </div>
    );

    // Renders a styled file input field
     const renderFileInputField = (name, label, Icon, error = null) => (
        <div className="mb-4"> {/* Reduced bottom margin */}
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label> {/* Adjusted margin */}
            <div className={`relative flex items-center border rounded-md p-2 transition-colors ${error ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} bg-gray-50 dark:bg-gray-700`}>
                 <Icon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" aria-hidden="true" />
                 <input
                    type="file"
                    id={name}
                    name={name}
                    onChange={handleInputChange}
                    className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-900/50 file:text-emerald-700 dark:file:text-emerald-300 hover:file:bg-emerald-100 dark:hover:file:bg-emerald-800/50 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-md"
                    aria-invalid={!!error}
                    aria-describedby={error ? `${name}-error` : undefined}
                 />
            </div>
            {formData[name] instanceof File && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">Selected: {formData[name].name}</p>}
            {error && <p id={`${name}-error`} className="mt-1 text-xs text-red-600 dark:text-red-500">{error}</p>}
        </div>
    );


    // --- Main Render ---
    return (
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            {/* Header Section: Adjust based on mode */}
            <div className="text-center mb-6">
                 <Package className="h-10 w-auto text-emerald-600 dark:text-emerald-500 mx-auto mb-2" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {authMode === 'login' && 'Welcome Back!'}
                    {authMode === 'signup' && 'Create Your Account'}
                    {authMode === 'forgotPassword' && 'Forgot Password?'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {authMode === 'login' && 'Login to access your account'}
                    {authMode === 'signup' && 'Sign up to get started'}
                    {authMode === 'forgotPassword' && 'Enter your email to receive a recovery link'}
                </p>
            </div>

            {/* Conditional Rendering: Login Form */}
            {authMode === 'login' && (
                <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                    {renderInputField('email', 'email', 'Email Address', Mail, true, errors.email)}
                    {renderPasswordField('password', 'Password', showPassword, setShowPassword, errors.password)}
                     <div className="flex items-center justify-between text-sm pt-1"> {/* Added pt-1 */}
                        <label htmlFor="remember-me" className="flex items-center cursor-pointer">
                            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-emerald-600 border-gray-300 dark:border-gray-600 rounded focus:ring-emerald-500 bg-gray-100 dark:bg-gray-700 focus:ring-offset-white dark:focus:ring-offset-gray-800" />
                            <span className="ml-2 text-gray-600 dark:text-gray-300">Remember me</span>
                        </label>
                        {/* Forgot Password Link */}
                        <button
                           type="button"
                           onClick={handleForgotPasswordClick}
                           className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 focus:outline-none focus:underline"
                        >
                            Forgot password?
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out mt-6" // Added mt-6
                    >
                         <LogIn className="w-5 h-5 mr-2" /> Login
                    </button>
                </form>
            )}

            {/* Conditional Rendering: Sign Up Form */}
            {authMode === 'signup' && (
                <form onSubmit={handleSignupSubmit} noValidate className="space-y-4">
                    {renderInputField('name', 'text', 'Full Name', User, true, errors.name)}
                    {renderInputField('email', 'email', 'Email Address', Mail, true, errors.email)}
                    {renderInputField('phone', 'tel', 'Phone Number', PhoneIcon, true, errors.phone)}
                    {renderPasswordField('password', 'Password (min. 6 characters)', showPassword, setShowPassword, errors.password)}
                    {renderPasswordField('confirmPassword', 'Confirm Password', showConfirmPassword, setShowConfirmPassword, errors.confirmPassword)}
                    <fieldset className="pt-1"> {/* Adjusted padding */}
                        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sign up as:</legend>
                        <div className="grid grid-cols-3 gap-3">
                            {Object.values(ROLES).map(role => (
                                <label key={role} htmlFor={`role-${role}`} className={`relative flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer focus-within:ring-2 focus-within:ring-emerald-500 transition-all duration-150 ${selectedRole === role ? 'bg-emerald-50 dark:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500' : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                                    <input type="radio" id={`role-${role}`} name="role" value={role} checked={selectedRole === role} onChange={handleRoleChange} className="sr-only" aria-labelledby={`role-${role}-label`} />
                                    <div className="text-center">
                                        {role === ROLES.CUSTOMER && <User className="w-5 h-5 mx-auto mb-1 text-gray-500 dark:text-gray-400" />}
                                        {role === ROLES.MERCHANT && <Briefcase className="w-5 h-5 mx-auto mb-1 text-gray-500 dark:text-gray-400" />}
                                        {role === ROLES.DSP && <Truck className="w-5 h-5 mx-auto mb-1 text-gray-500 dark:text-gray-400" />}
                                        <span id={`role-${role}-label`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">{role}</span>
                                    </div>
                                    {selectedRole === role && (
                                        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center p-1 bg-emerald-500 rounded-full text-white shadow">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    {/* Conditional Fields - Adjusted spacing */}
                    {selectedRole === ROLES.MERCHANT && (
                        <div className="pt-4 mt-2 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/30 animate-fade-in space-y-4">
                            {/* Added margin-bottom to title */}
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Merchant Details</h3>
                            {renderInputField('businessName', 'text', 'Business Name', Briefcase, true, errors.businessName)}
                            {renderFileInputField('documentation', 'Upload Documentation', FileText, errors.documentation)}
                            {renderInputField('locationLink', 'url', 'Google Maps Location Link', MapPin, true, errors.locationLink)}
                        </div>
                    )}
                    {selectedRole === ROLES.DSP && (
                         <div className="pt-4 mt-2 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/30 animate-fade-in space-y-4">
                            {/* Added margin-bottom to title */}
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Delivery Provider Details</h3>
                            {renderInputField('vehicleType', 'text', 'Vehicle Type (e.g., Bike, Car)', Truck, true, errors.vehicleType)}
                            {renderInputField('plateNumber', 'text', 'Plate Number', FileText, true, errors.plateNumber)}
                            {renderFileInputField('drivingLicense', 'Upload Driving License', FileText, errors.drivingLicense)}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out mt-6" // Added mt-6
                    >
                       <UserPlus className="w-5 h-5 mr-2" /> Sign Up
                    </button>
                </form>
            )}

             {/* Conditional Rendering: Forgot Password Form */}
            {authMode === 'forgotPassword' && (
                <form onSubmit={handleForgotPasswordSubmit} noValidate className="space-y-4">
                    {renderInputField('email', 'email', 'Enter your Email Address', Mail, true, errors.email)}
                    <button
                        type="submit"
                        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out mt-6" // Added mt-6
                    >
                        Send Recovery Link
                    </button>
                </form>
            )}


            {/* Toggle Mode / Back to Login Link */}
            <div className="mt-6 text-center text-sm">
                {authMode === 'login' && (
                    <>
                        <span className="text-gray-600 dark:text-gray-400">Don't have an account?</span>{' '}
                        <button onClick={toggleMode} className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 focus:outline-none focus:underline">
                            Sign Up
                        </button>
                    </>
                )}
                 {authMode === 'signup' && (
                    <>
                        <span className="text-gray-600 dark:text-gray-400">Already have an account?</span>{' '}
                        <button onClick={toggleMode} className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 focus:outline-none focus:underline">
                            Login
                        </button>
                    </>
                )}
                 {authMode === 'forgotPassword' && (
                     <button onClick={handleBackToLoginClick} className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 focus:outline-none focus:underline inline-flex items-center">
                         <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
                    </button>
                 )}
            </div>

            {/* Animation Style */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

