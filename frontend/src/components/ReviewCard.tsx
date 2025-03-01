import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageModal from './ImageModal';

interface ReviewCardProps {
    review: {
        user: {
            avatar: string | null;
            firebaseId: string;
            description: string;
        };
        rating: number;
        review: string;
        recipeImage: string | null;
        createdAt?: string;
    };
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    return (
        <>
            <motion.div
                className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                {/* Header with user info and rating */}
                <div className="p-6 pb-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            {review.user.avatar ? (
                                <img
                                    src={`data:image/jpeg;base64,${review.user.avatar}`}
                                    alt="User avatar"
                                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-200 dark:border-purple-900"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-600 dark:to-purple-800 text-white text-lg font-semibold">
                                    {review.user.firebaseId.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {review.user.description || `User${review.user.firebaseId.slice(0, 4)}`}
                                </span>
                                <div className="flex items-center mt-1 space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${
                                                i < review.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                                            }`}
                                        />
                                    ))}
                                    {review.createdAt && (
                                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                            • {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Review content */}
                <div className="px-6 py-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {review.review}
                    </p>
                </div>

                {/* Review image */}
                {review.recipeImage && (
                    <div className="px-6 pb-6">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="relative group cursor-zoom-in overflow-hidden rounded-lg"
                            onClick={() => setIsImageModalOpen(true)}
                        >
                            <img
                                src={`data:image/jpeg;base64,${review.recipeImage}`}
                                alt="Recipe review"
                                className="w-full h-64 object-cover transform transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="px-4 py-2 bg-black/50 text-white rounded-full text-sm backdrop-blur-sm">
                                    Click to zoom
                                </span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </motion.div>

            <ImageModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                imageUrl={`data:image/jpeg;base64,${review.recipeImage}`}
            />
        </>
    );
};

export default ReviewCard;
