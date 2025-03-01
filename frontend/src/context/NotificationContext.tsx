import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface NotificationContextType {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [message, setMessage] = useState<string>('');
    const [type, setType] = useState<'success' | 'error'>('success');
    const [isVisible, setIsVisible] = useState(false);

    const hideNotification = useCallback(() => {
        setIsVisible(false);
    }, []);

    const showNotification = useCallback((newMessage: string, newType: 'success' | 'error') => {
        setMessage(newMessage);
        setType(newType);
        setIsVisible(true);

        // Auto-hide after 3 seconds
        setTimeout(hideNotification, 3000);
    }, [hideNotification]);

    const showSuccess = useCallback((message: string) => {
        showNotification(message, 'success');
    }, [showNotification]);

    const showError = useCallback((message: string) => {
        showNotification(message, 'error');
    }, [showNotification]);

    return (
        <NotificationContext.Provider value={{ showSuccess, showError }}>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 right-5 transform -translate-x-1/2 z-50 w-full max-w-md"
                    >
                        <div className={`${
                            type === 'success' 
                                ? 'bg-green-100/90 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200' 
                                : 'bg-red-100/90 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200'
                        } backdrop-blur-sm border px-4 py-3 rounded-xl relative flex items-center justify-between shadow-lg`}>
                            <p className="flex-1 mr-2">{message}</p>
                            <button
                                onClick={hideNotification}
                                className={`${
                                    type === 'success'
                                        ? 'text-green-700 hover:text-green-900 dark:text-green-200 dark:hover:text-green-100'
                                        : 'text-red-700 hover:text-red-900 dark:text-red-200 dark:hover:text-red-100'
                                }`}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {children}
        </NotificationContext.Provider>
    );
};
