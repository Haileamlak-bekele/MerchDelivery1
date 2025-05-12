import React from 'react';

import { Package, ArrowLeft } from 'lucide-react';
import LoginForm from '../components/Auth/LoginForm';
import SignupForm from '../components/Auth/SignupForm';
import ForgotPasswordForm from '../components/Auth/ForgotPasswordForm';
import { useAuthForm } from '../hooks/useAuthForm';

const AuthPage = () => {
    const {
        authMode,
        selectedRole,
        formData,
        errors,
        isLoading,
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        handleInputChange,
        handleRoleChange,
        handleLoginSubmit,
        handleSignupSubmit,
        handleForgotPasswordSubmit,
        toggleMode,
        handleForgotPasswordClick,
        handleBackToLoginClick,
    } = useAuthForm();

    const getTitle = () => {
        if (authMode === 'login') return 'Welcome Back!';
        if (authMode === 'signup') return 'Create Your Account';
        if (authMode === 'forgotPassword') return 'Forgot Password?';
        return '';
    };

    const getSubtitle = () => {
        if (authMode === 'login') return 'Login to access your account';
        if (authMode === 'signup') return 'Sign up to get started';
        if (authMode === 'forgotPassword') return 'Enter your email to receive a recovery link';
        return '';
    };

    return (
        // This outer div centers the authentication card on the page.
        // It takes full height of its container and uses flex to center.
        <div className="flex items-center justify-center min-h-full py-12 px-4 sm:px-6 lg:px-8">
            {/* This is the main authentication card */}
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <div className="text-center mb-6">
                    <Package className="h-10 w-auto text-emerald-600 dark:text-emerald-500 mx-auto mb-2" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {getTitle()}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {getSubtitle()}
                    </p>
                </div>

                {authMode === 'login' && (
                    <LoginForm
                        formData={formData}
                        errors={errors}
                        handleInputChange={handleInputChange}
                        handleLoginSubmit={handleLoginSubmit}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        handleForgotPasswordClick={handleForgotPasswordClick}
                        isLoading={isLoading}
                    />
                )}

                {authMode === 'signup' && (
                    <SignupForm
                        formData={formData}
                        errors={errors}
                        selectedRole={selectedRole}
                        handleInputChange={handleInputChange}
                        handleRoleChange={handleRoleChange}
                        handleSignupSubmit={handleSignupSubmit}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        showConfirmPassword={showConfirmPassword}
                        setShowConfirmPassword={setShowConfirmPassword}
                        isLoading={isLoading}
                    />
                )}

                {authMode === 'forgotPassword' && (
                    <ForgotPasswordForm
                        formData={formData}
                        errors={errors}
                        handleInputChange={handleInputChange}
                        handleForgotPasswordSubmit={handleForgotPasswordSubmit}
                        isLoading={isLoading}
                    />
                )}

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

                {/* Animation Style (can be moved to a global CSS if preferred, or removed if not needed) */}
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
        </div>
    );
};

export default AuthPage; 