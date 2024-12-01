import React from 'react';
import { motion } from 'framer-motion';

const LoadingPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <motion.div
                className="flex space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {[1, 2, 3].map((index) => (
                    <motion.div
                        key={index}
                        className="w-4 h-4 bg-primary rounded-full"
                        animate={{
                            y: ["0%", "-50%", "0%"],
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: index * 0.2,
                        }}
                    />
                ))}
            </motion.div>
            <motion.p
                className="mt-4 text-gray-600 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                Loading delicious recipes...
            </motion.p>
        </div>
    );
};

export default LoadingPage;