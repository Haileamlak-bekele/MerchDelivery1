import { useState } from 'react';
import axios from 'axios';
import { ROLES } from '../constants';
import { API_BASE_URL } from '../config';

export const useAuthForm = () => {
    const [authMode, setAuthMode] = useState('login');
    const [selectedRole, setSelectedRole] = useState(ROLES.CUSTOMER);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '',
        businessName: '', documentation: null, locationLink: '',
        vehicleType: '', plateNumber: '', drivingLicense: null,
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
        setIsLoading(false);
    };

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

    const handleRoleChange = (e) => {
        const newRole = e.target.value;
        setSelectedRole(newRole);
        setFormData(prev => ({
            ...prev,
            businessName: '', documentation: null, locationLink: '',
            vehicleType: '', plateNumber: '', drivingLicense: null,
        }));
        // eslint-disable-next-line no-unused-vars
        const { businessName, documentation, locationLink, vehicleType, plateNumber, drivingLicense, ...commonErrors } = errors;
        setErrors(commonErrors);
    };

    const toggleMode = () => {
        const nextMode = authMode === 'login' ? 'signup' : 'login';
        resetFormState(nextMode);
    };

    const handleForgotPasswordClick = () => {
        resetFormState('forgotPassword');
    };

    const handleBackToLoginClick = () => {
        resetFormState('login');
    };

    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (authMode === 'signup') {
            if (!formData.name.trim()) newErrors.name = 'Name is required';
            
            if (!formData.email.trim()) newErrors.email = 'Email is required';
            else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';

            // Updated Phone Number Validation
            const rawPhone = formData.phone.trim();
            if (!rawPhone) {
                newErrors.phone = 'Phone number is required';
            } else {
                let phoneToValidate = rawPhone;
                let hasLeadingPlus = false;

                if (rawPhone.startsWith('+')) {
                    hasLeadingPlus = true;
                    phoneToValidate = rawPhone.substring(1);
                }

                if (!/^\d*$/.test(phoneToValidate)) { // Checks if all remaining characters are digits
                    if (hasLeadingPlus) {
                        newErrors.phone = 'Invalid characters after "+". Only digits are allowed.';
                    } else {
                        newErrors.phone = 'Invalid characters. Only digits and an optional leading "+" are allowed.';
                    }
                } else if (phoneToValidate.length < 10) {
                    newErrors.phone = 'Phone number must contain at least 10 digits (excluding any leading "+").';
                }
            }
            // End of Updated Phone Number Validation

            if (!formData.password) newErrors.password = 'Password is required';
            else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
            
            if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
            else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

            if (selectedRole === ROLES.MERCHANT) {
                if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
                if (!formData.documentation) newErrors.documentation = 'Documentation upload is required'; // Assuming File object or null
                if (!formData.locationLink.trim()) newErrors.locationLink = 'Location link is required';
            } else if (selectedRole === ROLES.DSP) {
                if (!formData.vehicleType.trim()) newErrors.vehicleType = 'Vehicle type is required';
                if (!formData.plateNumber.trim()) newErrors.plateNumber = 'Plate number is required';
                if (!formData.drivingLicense) newErrors.drivingLicense = 'Driving license upload is required'; // Assuming File object or null
            }
        } else if (authMode === 'login') {
            if (!formData.email.trim()) newErrors.email = 'Email is required';
            else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
            if (!formData.password) newErrors.password = 'Password is required';
        } else if (authMode === 'forgotPassword') {
            if (!formData.email.trim()) newErrors.email = 'Email is required';
            else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            console.log("Login validation failed:", errors);
            return;
        }
        setIsLoading(true);
        setErrors({});
        try {
            console.log("Sending login request:", { email: formData.email, password: formData.password });
            const response = await axios.post(`${API_BASE_URL}/users/login`, {
                email: formData.email,
                password: formData.password
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
            console.log("Login successful:", response.data);
            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                const userRole = response.data.user.role.toLowerCase();
                const redirectPaths = {
                    'customer': '/customer', 'admin': '/admin',
                    'merchant': '/merchant', 'dsp': '/dsp',
                };
                const redirectPath = redirectPaths[userRole] || '/';
                window.location.href = redirectPath;
            }
        } catch (error) {
            console.error("Login error:", error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            setErrors(prev => ({ ...prev, form: errorMessage }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            console.log("Signup validation failed:", errors);
            return;
        }
        setIsLoading(true);
        setErrors({});
        try {
            let response;
            if (selectedRole === ROLES.MERCHANT || selectedRole === ROLES.DSP) {
                const formDataToSend = new FormData();
                formDataToSend.append('name', formData.name);
                formDataToSend.append('email', formData.email);
                formDataToSend.append('phoneNumber', formData.phone);
                formDataToSend.append('password', formData.password);
                formDataToSend.append('role', selectedRole);

                if (selectedRole === ROLES.MERCHANT) {
                    formDataToSend.append('storeName', formData.businessName);
                    formDataToSend.append('location', formData.locationLink);
                    if (formData.documentation) {
                        formDataToSend.append('tradeLicense', formData.documentation);
                    }
                } else if (selectedRole === ROLES.DSP) {
                    formDataToSend.append('vehicleDetails', JSON.stringify({
                        type: formData.vehicleType,
                        plateNumber: formData.plateNumber
                    }));
                    if (formData.drivingLicense) {
                        formDataToSend.append('drivingLicense', formData.drivingLicense);
                    }
                }

                response = await axios.post(`${API_BASE_URL}/users/add`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Customer: send as JSON
                const signupPayload = {
                    name: formData.name,
                    email: formData.email,
                    phoneNumber: formData.phone,
                    password: formData.password,
                    role: selectedRole
                };
                response = await axios.post(`${API_BASE_URL}/users/add`, signupPayload, {
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            console.log("Signup successful:", response.data);
            if (response.data.token) {
                // Store token and user data
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: response.data.id,
                    name: response.data.name,
                    email: response.data.email,
                    role: response.data.role,
                    phoneNumber: response.data.phoneNumber,
                    status: response.data.status
                }));
                // Redirect based on role
                const role = response.data.role.toLowerCase();
                switch (role) {
                    case 'customer':
                        window.location.href = '/customer';
                        break;
                    case 'merchant':
                        window.location.href = '/';
                        break;
                    case 'dsp':
                        window.location.href = '/';
                        break;
                    default:
                        window.location.href = '/';
                        break;
                }
            } else {
                setErrors(prev => ({ ...prev, form: response.data.message || 'Signup completed but no token received.'}));
            }
        } catch (error) {
            console.error("Signup error:", error.response ? error.response.data : error.message);
            let errorMessage = error.response?.data?.message || error.response?.data?.error || 'Signup failed. Please try again.';
            // If there are nested Mongoose validation errors, display the first one
            if (error.response?.data?.error && typeof error.response.data.error === 'object') {
                const errObj = error.response.data.error;
                if (errObj.errors) {
                    // Get the first error message from Mongoose validation errors
                    const firstKey = Object.keys(errObj.errors)[0];
                    if (firstKey && errObj.errors[firstKey]?.message) {
                        errorMessage = errObj.errors[firstKey].message;
                    }
                }
            }
            setErrors(prev => ({ ...prev, form: errorMessage }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            console.log("Forgot password validation failed:", errors);
            return;
        }
        setIsLoading(true);
        setErrors({});
        console.log("Forgot Password Request:", { email: formData.email });
        alert('Password recovery link sent (simulation)! Check console.');
        setIsLoading(false);
    };

    return {
        authMode, selectedRole, formData, errors, isLoading,
        showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword,
        handleInputChange, handleRoleChange,
        handleLoginSubmit, handleSignupSubmit, handleForgotPasswordSubmit,
        toggleMode, handleForgotPasswordClick, handleBackToLoginClick,
    };
}; 