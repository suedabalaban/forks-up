import React from 'react';
import { motion } from 'framer-motion';

const LoadingPage: React.FC = () => {
    const containerVariants = {
        initial: { opacity: 0 },
        animate: { 
            opacity: 1,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.2
            }
        }
    };

    const dotVariants = {
        initial: { y: 0 },
        animate: { 
            y: [-10, 0, -10],
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <motion.div
                className="flex items-center justify-center space-x-3"
                variants={containerVariants}
                initial="initial"
                animate="animate"
            >
                {[0, 1, 2].map((index) => (
                    <motion.div
                        key={index}
                        className="w-4 h-4 rounded-full bg-primary"
                        variants={dotVariants}
                        style={{ 
                            animationDelay: `${index * 0.2}s`,
                            backgroundColor: '#9333ea' // primary renk
                        }}
                    />
                ))}
            </motion.div>
            <motion.p
                className="mt-6 text-lg text-gray-600 font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
            >
                Tarifler yükleniyor...
            </motion.p>
        </div>
    );
};

export default LoadingPage;