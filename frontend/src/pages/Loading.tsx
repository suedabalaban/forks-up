import React from 'react';
import { motion } from 'framer-motion';

const LoadingPage: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <motion.div
                    className="flex flex-col items-center space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-900 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-500 dark:border-purple-400 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <motion.p 
                        className="text-lg font-medium text-gray-600 dark:text-gray-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        Loading...
                    </motion.p>
                    <motion.p 
                        className="text-sm text-gray-500 dark:text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Preparing your delicious experience
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
};

export default LoadingPage;