import React from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

const PasswordField = ({ name, placeholder, value, onChange, show, setShow, error = null, className = '' }) => (
    <div className={`relative mb-4 ${className}`}>
        <label htmlFor={name} className="sr-only">{placeholder}</label>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
            type={show ? 'text' : 'password'}
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            required
            placeholder={placeholder}
            className={`relative w-full pl-10 pr-10 py-2.5 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-150 ease-in-out ${error ? 'border-red-500 dark:border-red-600 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
        />
        <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 m-1 z-10"
            aria-label={show ? "Hide password" : "Show password"}
        >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
        {error && <p id={`${name}-error`} className="mt-1 text-xs text-red-600 dark:text-red-500">{error}</p>}
    </div>
);

export default PasswordField; 