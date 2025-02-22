import React, { useState, useEffect } from "react";
import { Close } from "@mui/icons-material";
import { Star, UserRound, Users, Printer, PlayCircle, Timer } from "lucide-react";
import { auth } from "../config/firebaseconfig";
import axios from "axios";
import { Recipe } from "../model/Recipe";
import {addFavorite, checkFavoriteStatus, removeFavorite, getPantryItems} from "../api/ForksUpAPI";
import { getIngredientEmoji } from "../utils/ingredientEmojis";
import { motion, AnimatePresence } from "framer-motion";
import { usePantry } from '../context/PantryContext';

type RecipeDetailsProps = {
    recipe: Recipe;
    onClose: () => void;
    onStartRecipe?: (recipe: Recipe) => void;
};

type YouTubeVideo = {
    id: string;
    title: string;
    thumbnail: string;
};

const RecipeDetails: React.FC<RecipeDetailsProps> = ({recipe, onClose, onStartRecipe}) => {
    const { pantryIngredients } = usePantry();
    const [isFavorite, setIsFavorite] = useState(false);
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const YOUTUBE_API_KEY = 'AIzaSyAOJIp4JcDsW--0SKq5pDhgrPG19DdcO30';

    useEffect(() => {
        const fetchFavoriteStatus = async () => {
            try {
                const favoriteStatus = await checkFavoriteStatus(recipe.id);
                setIsFavorite(favoriteStatus);
            } catch (error) {
                console.error('Error fetching favorite status:', error);
            }
        };

        fetchFavoriteStatus();

        // YouTube search effect
        const fetchYouTubeVideos = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(
                    `https://www.googleapis.com/youtube/v3/search`,
                    {
                        params: {
                            part: 'snippet',
                            maxResults: 3,
                            q: `${recipe.name} recipe how to cook`,
                            type: 'video',
                            key: YOUTUBE_API_KEY
                        }
                    }
                );

                const videoResults = response.data.items.map((item: any) => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.medium.url
                }));

                setVideos(videoResults);
            } catch (err) {
                setError('Failed to load YouTube videos');
                console.error('YouTube API Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchYouTubeVideos();
    }, [recipe.id, recipe.name]);

    // Add helper function to check pantry ingredients
    const isIngredientInPantry = (ingredientName: string) => {
        return pantryIngredients.some(pantryItem =>
            ingredientName.toLowerCase().includes(pantryItem) || pantryItem.includes(ingredientName.toLowerCase())
        );
    };

    const toggleFavorite = async () => {
        try {
            if (isFavorite) {
                await removeFavorite(recipe.id);
            } else {
                await addFavorite(recipe.id);
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error toggling favorite status:', error);
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${recipe.name} - Recipe</title>
                <style>
                    body {
                        font-family: -apple-system, system-ui, sans-serif;
                        line-height: 1.5;
                        padding: 2rem;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    h1 { font-size: 2rem; margin-bottom: 1rem; }
                    h2 { font-size: 1.5rem; margin: 2rem 0 1rem; }
                    .description { color: #666; margin-bottom: 2rem; }
                    .info { margin-bottom: 2rem; }
                    .ingredients { margin-bottom: 2rem; }
                    .ingredients li { margin-bottom: 0.5rem; }
                    .steps li { margin-bottom: 1rem; }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <h1>${recipe.name}</h1>
                <p class="description">${recipe.description}</p>
                
                <div class="info">
                    <p><strong>Servings:</strong> ${recipe.servings}</p>
                </div>

                <h2>🥘 Ingredients</h2>
                <ul class="ingredients">
                    ${recipe.ingredientsRawStr?.map(ingredient => {
                        const emoji = getIngredientEmoji(ingredient);
                        return `<li>${emoji || '•'} ${ingredient}</li>`;
                    }).join('')}
                </ul>

                <h2>📝 Instructions</h2>
                <ol class="steps">
                    ${recipe.steps?.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    };

    const handleStartRecipe = () => {
        onStartRecipe?.(recipe);
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50 flex items-center justify-center p-4 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-6xl w-full mx-4 max-h-[85vh] flex flex-row overflow-hidden relative"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    transition={{ type: "spring", damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Main Content */}
                    <motion.div
                        className="flex-1 p-8 overflow-y-auto"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="max-w-3xl">
                            <motion.button
                                className="absolute top-6 right-6 p-2 text-gray-400 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-full"
                                onClick={onClose}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Close className="w-6 h-6" />
                            </motion.button>

                            {/* Header Section */}
                            <div className="mb-8">
                                <div className="flex items-start justify-between mb-2">
                                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                                        {recipe.name}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <motion.button
                                            onClick={handleStartRecipe}
                                            whileHover={{ scale: 1.1, backgroundColor: "rgb(147 51 234 / 0.2)" }}
                                            whileTap={{ scale: 0.95 }}
                                            className="p-2 rounded-full bg-purple-500/10 dark:bg-purple-500/20 hover:bg-purple-500/20 dark:hover:bg-purple-500/30 transition-all duration-300"
                                            title="Start Cooking"
                                        >
                                            <Timer className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                                        </motion.button>
                                        <motion.button
                                            onClick={toggleFavorite}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                                            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                        >
                                            <Star
                                                className={`w-7 h-7 transition-colors duration-200
                                                ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                            />
                                        </motion.button>
                                        <motion.button 
                                            onClick={handlePrint}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                                            title="Print Recipe"
                                        >
                                            <Printer className="w-7 h-7 text-gray-400 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-300" />
                                        </motion.button>
                                    </div>
                                </div>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                                    {recipe.description}
                                </p>
                                
                                {/* Search Terms */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {recipe.searchTerms.map((term, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full text-sm"
                                        >
                                            {term}
                                        </span>
                                    ))}
                                </div>
                                
                                {/* Recipe Info */}
                                <div className="flex items-center gap-6 text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        <span>Serves {recipe.servings}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Ingredients Section */}
                            <motion.div 
                                className="mb-8"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                    <span>🥘</span>
                                    <span>Ingredients</span>
                                </h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {recipe.ingredientsRawStr?.map((ingredient, index) => {
                                        const inPantry = isIngredientInPantry(ingredient);
                                        return (
                                            <motion.li
                                                key={index}
                                                className="flex items-center gap-3 text-gray-600 dark:text-gray-300"
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg ${
                                                    inPantry 
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/40'
                                                        : 'bg-red-100 dark:bg-red-900/40'
                                                }`}>
                                                    {getIngredientEmoji(ingredient) || '•'}
                                                </span>
                                                <span>{ingredient}</span>
                                            </motion.li>
                                        );
                                    })}
                                </ul>
                            </motion.div>

                            {/* Steps Section */}
                            <motion.div
                                className="mb-8"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                    <span>📝</span>
                                    <span>Instructions</span>
                                </h3>
                                <ol className="space-y-4">
                                    {recipe.steps?.map((step, index) => (
                                        <motion.li
                                            key={index}
                                            className="flex gap-4 text-gray-600 dark:text-gray-300"
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                        >
                                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 font-medium">
                                                {index + 1}
                                            </span>
                                            <p className="mt-1">{step}</p>
                                        </motion.li>
                                    ))}
                                </ol>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Video Sidebar */}
                    <motion.div
                        className="w-96 bg-gray-50 dark:bg-gray-700/50 p-8 overflow-y-auto border-l border-gray-100 dark:border-gray-700"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Related Videos</h3>
                        {loading && (
                            <div className="text-gray-500 dark:text-gray-300 animate-pulse">Loading videos...</div>
                        )}
                        {error && (
                            <div className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">
                                {error}
                            </div>
                        )}
                        <div className="space-y-6">
                            {videos.map((video) => (
                                <a
                                    key={video.id}
                                    href={`https://www.youtube.com/watch?v=${video.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block group"
                                >
                                    <div className="relative rounded-xl overflow-hidden">
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-full transition duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                                    </div>
                                    <h4 className="mt-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors line-clamp-2">
                                        {video.title}
                                    </h4>
                                </a>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default RecipeDetails;