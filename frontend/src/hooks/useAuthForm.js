import { useState } from 'react';
import axios from 'axios';
import { ROLES } from '../constants';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

export const useAuthForm = () => {
    const [authMode, setAuthMode] = useState('login');
    const [selectedRole, setSelectedRole] = useState(ROLES.CUSTOMER);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '',
        businessName: '', documentation: null, location: null,
        vehicleType: '', plateNumber: '', drivingLicense: null,
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const resetFormState = (mode = 'login', role = ROLES.CUSTOMER) => {
        setFormData({
            name: '', email: '', phone: '', password: '', confirmPassword: '',
            businessName: '', documentation: null, location: null,
            vehicleType: '', plateNumber: '', drivingLicense: null,
        });
        setSelectedRole(role);
        setErrors({});
        setShowPassword(false);
        setShowConfirmPassword(false);
        setAuthMode(mode);
        setIsLoading(false);
    };

    // Accepts both event and direct value for location
    const handleInputChange = (e) => {
        if (e && e.target) {
            const { name, value, type, files } = e.target;
            const inputValue = type === 'file' ? files[0] : value;
            setFormData(prev => ({ ...prev, [name]: inputValue }));
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: null }));
            }
            if (name === 'password' && errors.confirmPassword) {
                setErrors(prev => ({ ...prev, confirmPassword: null }));
            }
        } else if (e && e.name === 'location') {
            setFormData(prev => ({ ...prev, location: e.value }));
            if (errors.location) {
                setErrors(prev => ({ ...prev, location: null }));
            }
        }
    };

    const handleRoleChange = (e) => {
        const newRole = e.target.value;
        setSelectedRole(newRole);
        setFormData(prev => ({
            ...prev,
            businessName: '', documentation: null, location: null,
            vehicleType: '', plateNumber: '', drivingLicense: null,
        }));
        // eslint-disable-next-line no-unused-vars
        const { businessName, documentation, location, vehicleType, plateNumber, drivingLicense, ...commonErrors } = errors;
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

                if (!/^\d*$/.test(phoneToValidate)) {
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
                if (!formData.documentation) newErrors.documentation = 'Documentation upload is required';
                if (!formData.location || !formData.location.lat || !formData.location.lng) {
                    newErrors.location = 'Business location is required';
                }
            } else if (selectedRole === ROLES.DSP) {
                if (!formData.vehicleType.trim()) newErrors.vehicleType = 'Vehicle type is required';
                if (!formData.plateNumber.trim()) newErrors.plateNumber = 'Plate number is required';
                if (!formData.drivingLicense) newErrors.drivingLicense = 'Driving license upload is required';
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
                let user = response.data.user;
                // Patch: ensure _id exists
                if (!user._id && user.id) user._id = user.id;
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(user));
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
                    // Send location as JSON string or as separate fields
                    formDataToSend.append('location', JSON.stringify(formData.location));
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
            } else if (selectedRole === ROLES.CUSTOMER) {
                // Customer registration
                response = await axios.post(`${API_BASE_URL}/users/add`, {
                    name: formData.name,
                    email: formData.email,
                    phoneNumber: formData.phone,
                    password: formData.password,
                    role: selectedRole
                }, {
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            if (response && response.data) {
                // For merchant or DSP, if payment is needed, go to payment page
                if (response.data.needsPayment && (selectedRole === ROLES.MERCHANT || selectedRole === ROLES.DSP)) {
                    navigate('/payment', {
                        state: {
                            merchantId: response.data.merchantId,
                            dspId: response.data.dspId,
                            role: selectedRole,
                            email: formData.email
                        }
                    });
                } else if (selectedRole === ROLES.CUSTOMER) {
                    // For customer, go to login page after registration
                    navigate('/customer'); // or '/login' if that's your login route
                }
            }
        } catch (error) {
            console.error('Signup error:', error);
            setErrors({
                form: error.response?.data?.message || 'An error occurred during signup'
            });
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