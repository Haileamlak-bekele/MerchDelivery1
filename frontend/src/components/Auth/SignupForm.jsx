import React from 'react';
import FormField from './FormField';
import PasswordField from './PasswordField';
import FileInputField from './FileInputField';
import { ROLES } from '../../constants.js'; // Ensure this path is correct and add .js
import { User, Mail, Phone as PhoneIcon, Briefcase, MapPin, Truck, FileText, UserPlus } from 'lucide-react';

const SignupForm = ({
    formData,
    errors,
    selectedRole,
    handleInputChange,
    handleRoleChange,
    handleSignupSubmit,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isLoading // Assuming you might add isLoading state to useAuthForm
}) => {
    return (
        <form onSubmit={handleSignupSubmit} noValidate className="space-y-4">
            <FormField
                name="name"
                type="text"
                placeholder="Full Name"
                Icon={User}
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
            />
            <FormField
                name="email"
                type="email"
                placeholder="Email Address"
                Icon={Mail}
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
            />
            <FormField
                name="phone"
                type="tel"
                placeholder="Phone Number"
                Icon={PhoneIcon}
                value={formData.phone}
                onChange={handleInputChange}
                error={errors.phone}
            />
            <PasswordField
                name="password"
                placeholder="Password (min. 6 characters)"
                value={formData.password}
                onChange={handleInputChange}
                show={showPassword}
                setShow={setShowPassword}
                error={errors.password}
            />
            <PasswordField
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                show={showConfirmPassword}
                setShow={setShowConfirmPassword}
                error={errors.confirmPassword}
            />

            <fieldset className="pt-1">
                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sign up as:</legend>
                <div className="grid grid-cols-3 gap-3">
                    {Object.values(ROLES).map(role => (
                        <label
                            key={role}
                            htmlFor={`role-${role}`}
                            className={`relative flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer focus-within:ring-2 focus-within:ring-emerald-500 transition-all duration-150 ${selectedRole === role ? 'bg-emerald-50 dark:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500' : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                        >
                            <input
                                type="radio"
                                id={`role-${role}`}
                                name="role"
                                value={role}
                                checked={selectedRole === role}
                                onChange={handleRoleChange}
                                className="sr-only"
                                aria-labelledby={`role-${role}-label`}
                            />
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

            {selectedRole === ROLES.MERCHANT && (
                <div className="pt-4 mt-2 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/30 animate-fade-in space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Merchant Details</h3>
                    <FormField
                        name="businessName"
                        type="text"
                        placeholder="Business Name"
                        Icon={Briefcase}
                        value={formData.businessName}
                        onChange={handleInputChange}
                        error={errors.businessName}
                    />
                    <FileInputField
                        name="documentation"
                        label="Upload Documentation"
                        Icon={FileText}
                        onChange={handleInputChange}
                        file={formData.documentation}
                        error={errors.documentation}
                    />
                    <FormField
                        name="locationLink"
                        type="url"
                        placeholder="Google Maps Location Link"
                        Icon={MapPin}
                        value={formData.locationLink}
                        onChange={handleInputChange}
                        error={errors.locationLink}
                    />
                </div>
            )}

            {selectedRole === ROLES.DSP && (
                <div className="pt-4 mt-2 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/30 animate-fade-in space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Delivery Provider Details</h3>
                    <FormField
                        name="vehicleType"
                        type="text"
                        placeholder="Vehicle Type (e.g., Bike, Car)"
                        Icon={Truck}
                        value={formData.vehicleType}
                        onChange={handleInputChange}
                        error={errors.vehicleType}
                    />
                    <FormField
                        name="plateNumber"
                        type="text"
                        placeholder="Plate Number"
                        Icon={FileText} // Consider a more specific icon if available
                        value={formData.plateNumber}
                        onChange={handleInputChange}
                        error={errors.plateNumber}
                    />
                    <FileInputField
                        name="drivingLicense"
                        label="Upload Driving License"
                        Icon={FileText} // Consider a more specific icon if available
                        onChange={handleInputChange}
                        file={formData.drivingLicense}
                        error={errors.drivingLicense}
                    />
                </div>
            )}
            {errors.form && <p className="mt-1 text-xs text-red-600 dark:text-red-500">{errors.form}</p>}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out mt-6 disabled:opacity-50"
            >
                {isLoading ? 'Signing up...' : (
                    <>
                        <UserPlus className="w-5 h-5 mr-2" /> Sign Up
                    </>
                )}
            </button>
        </form>
    );
};

export default SignupForm; 