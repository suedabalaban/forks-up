import React, { useState, useEffect } from 'react';
import { getUserReviews, deleteUserReview } from '../api/UserAPI';
import { Link } from 'react-router-dom';
import { MessageSquare, Clock, UserRound } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import ReviewCard from '../components/ReviewCard';
import { motion } from 'framer-motion';
import {Review} from "../model/Review";
import { getCountryFlagFromTags } from "../utils/countryFlags";
import { getPreparationTimeFromTags } from "../utils/preparationTime";
import { usePexelsImage } from '../hooks/usePexelsImage';

const ReviewItem: React.FC<{ 
    review: Review; 
    onDelete: (id: string) => void;
    index: number;
}> = ({ review, onDelete, index }) => {
    const fallbackImage = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
    const { imageUrl, loading: imageLoading } = usePexelsImage(
        review.recipe.name, 
        review.recipe.imageUrl || fallbackImage
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200"
        >
            <div className="flex flex-row p-4 gap-6">
                <div className="w-56 h-56 relative flex-shrink-0">
                    <img
                        src={imageUrl}
                        alt={review.recipe.name}
                        className={`w-full h-full object-cover rounded-xl ${
                            imageLoading ? 'animate-pulse bg-gray-200 dark:bg-gray-700' : ''
                        }`}
                    />
                    <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-black/30 backdrop-blur-sm text-2xl border border-white/10">
                            {getCountryFlagFromTags(review.recipe.tags)}
                        </span>
                    </div>
                </div>

                {/* Recipe Details */}
                <div className="flex-1 py-2">
                    <button
                        onClick={() => window.location.href = `/recipe/${review.recipe.id}`}
                        className="text-xl font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors mb-2"
                    >
                        {review.recipe.name}
                    </button>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {review.recipe.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {getPreparationTimeFromTags(review.recipe.tags) && (
                            <span className="inline-flex items-center gap-2">
                                <Clock size={16} className="text-amber-400" />
                                {getPreparationTimeFromTags(review.recipe.tags)}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-2">
                            <UserRound size={16} />
                            {review.recipe.servings} servings
                        </span>
                        <span className="inline-flex items-center gap-2">
                            🥘 {review.recipe.ingredients.length} ingredients
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                        {review.recipe.tags.slice(0, 3).map((tag, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            >
                                {tag}
                            </span>
                        ))}
                        {review.recipe.tags.length > 3 && (
                            <span className="text-sm text-gray-500">
                                +{review.recipe.tags.length - 3} more
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="p-4">
                    <ReviewCard review={{...review, review: review.review}} />
                </div>
                <div className="flex justify-end px-4 pb-4">
                    <button
                        onClick={() => onDelete(review.id)}
                        className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                        Delete Review
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const UserReviews: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await getUserReviews();
            setReviews(data);
        } catch (err) {
            setError("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await deleteUserReview(reviewId);
                showSuccess("Review deleted successfully");
                setReviews(reviews.filter(review => review.id !== reviewId));
            } catch (err) {
                showError("Failed to delete review");
            }
        }
    };

    const handleRecipeClick = (recipeId: string) => {
        window.location.href = `/recipe/${recipeId}`;
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your reviews...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto px-8 py-5"
        >
            <h1 className="text-4xl w-full items-center justify-center flex flex-row mt-6 font-semibold mb-8">
                <MessageSquare className="mr-3 h-10 w-10 text-purple-600 dark:text-purple-400"/>
                <span className="text-gray-900 dark:text-gray-100">Your Reviews</span>
            </h1>

            {reviews.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                >
                    <div className="mb-6 text-6xl">
                        ✍️
                    </div>
                        Share your thoughts about recipes you've tried! Your reviews help others discover great recipes.
                    <Link
                        to="/search" 
                        className="inline-flex items-center px-6 py-3 rounded-lg bg-purple-600 dark:bg-purple-500 text-white hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors duration-300"
                    >
                        Find Recipes to Review
                    </Link>
                </motion.div>
            ) : (
                <div className="space-y-8">
                    {reviews.map((review, index) => (
                        <ReviewItem 
                            key={review.id}
                            review={review}
                            onDelete={handleDeleteReview}
                            index={index}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default UserReviews;