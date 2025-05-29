import React from 'react';
import FormField from './FormField';
import PasswordField from './PasswordField';
import { Mail, LogIn } from 'lucide-react';

const LoginForm = ({
    formData,
    errors,
    handleInputChange,
    handleLoginSubmit,
    showPassword,
    setShowPassword,
    handleForgotPasswordClick,
    isLoading // Assuming you might add isLoading state to useAuthForm
}) => {
    return (
        <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
            <FormField
                name="email"
                type="email"
                placeholder="Email Address"
                Icon={Mail}
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
            />
            <PasswordField
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                show={showPassword}
                setShow={setShowPassword}
                error={errors.password}
            />
            {/* <div className="flex items-center justify-between text-sm pt-1">
                <label htmlFor="remember-me" className="flex items-center cursor-pointer">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-emerald-600 border-gray-300 dark:border-gray-600 rounded focus:ring-emerald-500 bg-gray-100 dark:bg-gray-700 focus:ring-offset-white dark:focus:ring-offset-gray-800"
                        // onChange={e => handleInputChange({ target: { name: 'rememberMe', value: e.target.checked, type: 'checkbox' }})} // If you add rememberMe to formData
                        // checked={formData.rememberMe || false}
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-300">Remember me</span>
                </label>
                <button
                    type="button"
                    onClick={handleForgotPasswordClick}
                    className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 focus:outline-none focus:underline"
                >
                    Forgot password?
                </button>
            </div> */}
            {errors.form && <p className="mt-1 text-xs text-red-600 dark:text-red-500">{errors.form}</p>}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out mt-6 disabled:opacity-50"
            >
                {isLoading ? 'Logging in...' : (
                    <>
                        <LogIn className="w-5 h-5 mr-2" /> Login
                    </>
                )}
            </button>
        </form>
    );
};

export default LoginForm; 