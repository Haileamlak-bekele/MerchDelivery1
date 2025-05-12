import React from 'react';

const FormField = ({ name, type, placeholder, Icon, value, onChange, isRequired = true, error = null, className = '' }) => (
    <div className={`relative mb-4 ${className}`}>
        <label htmlFor={name} className="sr-only">{placeholder}</label>
        {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
        )}
        <input
            type={type}
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            required={isRequired}
            placeholder={placeholder}
            className={`relative w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-150 ease-in-out ${error ? 'border-red-500 dark:border-red-600 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
        />
        {error && <p id={`${name}-error`} className="mt-1 text-xs text-red-600 dark:text-red-500">{error}</p>}
    </div>
);

export default FormField; 