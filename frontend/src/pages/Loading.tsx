import React from 'react';
import { Loader } from 'lucide-react';

const LoadingPage = () => {
    return (
        <div className="flex items-center justify-center h-full bg-white">
            <div className="text-center">
                <Loader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-700 text-lg font-medium">Loading...</p>
            </div>
        </div>
    );
};

export default LoadingPage;