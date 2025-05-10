import React from 'react';
import FormField from './FormField';
import { Mail } from 'lucide-react';

const ForgotPasswordForm = ({
    formData,
    errors,
    handleInputChange,
    handleForgotPasswordSubmit,
    isLoading
}) => {
    return (
        <form onSubmit={handleForgotPasswordSubmit} noValidate className="space-y-4">
            <FormField
                name="email"
                type="email"
                placeholder="Enter your Email Address"
                Icon={Mail}
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
            />
            {errors.form && <p className="mt-1 text-xs text-red-600 dark:text-red-500">{errors.form}</p>}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out mt-6 disabled:opacity-50"
            >
                {isLoading ? 'Sending...' : 'Send Recovery Link'}
            </button>
        </form>
    );
};

export default ForgotPasswordForm; 