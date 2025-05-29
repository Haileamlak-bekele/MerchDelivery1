import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

const RegistrationSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { role } = location.state || { role: 'user' };

    const getRoleSpecificMessage = () => {
        switch (role) {
            case 'merchant':
                return {
                    title: 'Merchant Registration Successful!',
                    message: 'Your merchant account has been created successfully. Please wait for admin approval to start using your account. We will notify you once your account is approved.',
                    nextSteps: [
                        'Check your email for registration confirmation',
                        'Wait for admin approval (usually within 24-48 hours)',
                        'Once approved, you can log in and start managing your store'
                    ]
                };
            case 'dsp':
                return {
                    title: 'DSP Registration Successful!',
                    message: 'Your delivery service provider account has been created successfully. Please wait for admin approval to start accepting deliveries. We will notify you once your account is approved.',
                    nextSteps: [
                        'Check your email for registration confirmation',
                        'Wait for admin approval (usually within 24-48 hours)',
                        'Once approved, you can log in and start accepting deliveries'
                    ]
                };
            default:
                return {
                    title: 'Registration Successful!',
                    message: 'Your account has been created successfully.',
                    nextSteps: ['You can now log in to your account']
                };
        }
    };

    const { title, message, nextSteps } = getRoleSpecificMessage();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                <div className="text-center">
                    <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
                    <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {message}
                    </p>
                </div>

                <div className="mt-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Next Steps:</h3>
                        <ul className="space-y-3">
                            {nextSteps.map((step, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="flex-shrink-0 h-5 w-5 text-green-500">•</span>
                                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{step}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                        Return to Home
                    </button>

                    {(role === 'merchant' || role === 'dsp') && (
                        <button
                            onClick={() => navigate('/payment')}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                            Finish Payment
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegistrationSuccess;
