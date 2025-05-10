import React from 'react';

const FileInputField = ({ name, label, Icon, onChange, file, error = null, className = '' }) => (
    <div className={`mb-4 ${className}`}>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
        <div className={`relative flex items-center border rounded-md p-2 transition-colors ${error ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} bg-gray-50 dark:bg-gray-700`}>
            {Icon && <Icon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" aria-hidden="true" />}
            <input
                type="file"
                id={name}
                name={name}
                onChange={onChange}
                className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-900/50 file:text-emerald-700 dark:file:text-emerald-300 hover:file:bg-emerald-100 dark:hover:file:bg-emerald-800/50 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-md"
                aria-invalid={!!error}
                aria-describedby={error ? `${name}-error` : undefined}
            />
        </div>
        {file instanceof File && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">Selected: {file.name}</p>}
        {error && <p id={`${name}-error`} className="mt-1 text-xs text-red-600 dark:text-red-500">{error}</p>}
    </div>
);

export default FileInputField; 