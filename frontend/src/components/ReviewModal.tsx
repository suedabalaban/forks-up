import React, { useState, useEffect } from 'react';
import {Star, Image as ImageIcon, X, Plus, Minus, Search, Trash2} from 'lucide-react';
import { Recipe } from '../model/Recipe';
import { PantryItem } from '../model/PantryItem';
import { Ingredient } from '../model/Ingredient';
import { getIngredientEmoji } from '../utils/ingredientEmojis';
import { measurementUnits, MeasurementUnit } from '../utils/MeasurementUnit';
import {AnimatePresence, motion} from "framer-motion";
import {addIngredient, getPantryItems, removeIngredient, updateQuantity} from "../api/PantryAPI";
import {getIngredients} from "../api/IngredientAPI";
import {submitRecipeReview} from "../api/RecipeAPI";

interface ReviewModalProps {
    recipe: Recipe;
    onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ recipe, onClose }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [updatePantry, setUpdatePantry] = useState(true);
    const [showSkipButton, setShowSkipButton] = useState(true);
    const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
    const [newItemQuantity, setNewItemQuantity] = useState(1);
    const [newItemUnit, setNewItemUnit] = useState<MeasurementUnit>('PIECE');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        fetchPantryItems();
    }, []);

    const fetchPantryItems = async () => {
        try {
            setLoading(true);
            const response = await getPantryItems();
            setPantryItems(response.data);
        } catch (err) {
            setError('Error loading pantry items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const searchIngredients = async () => {
            if (searchQuery.trim() === '') {
                setSearchResults([]);
                return;
            }

            try {
                const response = await getIngredients(searchQuery);
                setSearchResults(response.data);
            } catch (err) {
                setError('Error searching ingredients');
            }
        };

        const timeoutId = setTimeout(searchIngredients, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleUpdateQuantity = async (ingredientId: string, quantity: number, unit: string) => {
        try {
            await updateQuantity(ingredientId, quantity, unit);
            await fetchPantryItems();
        } catch (err) {
            setError('Error updating quantity');
        }
    };

    const handleAddNewIngredient = async (ingredient: Ingredient) => {
        try {
            await addIngredient(ingredient.id, newItemQuantity, newItemUnit);
            setSearchQuery('');
            setSearchResults([]);
            setIsAddingNew(false);
            await fetchPantryItems();
        } catch (err) {
            setError('Error adding new ingredient');
        }
    };

    const handleRemoveIngredient = async (ingredientId: string) => {
        try {
            await removeIngredient(ingredientId);
            await fetchPantryItems();
        } catch (err) {
            setError('An error occurred while deleting the ingredient\n');
        }
    };

    const handleSubmit = async () => {
        try {
            await submitRecipeReview({
                recipeId: recipe.id,
                rating,
                comment,
                image: image || undefined
            });
            setShowSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Error submitting review:', error);
            setError('Failed to submit review. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
    <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-5xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Recipe Completed! 🎉
            </h2>
            <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Review Form */}
            <div className="space-y-6">
                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                        How was the recipe?
                    </label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className={`p-2 transition-all transform hover:scale-110 ${
                                    rating >= star 
                                        ? 'text-yellow-400' 
                                        : 'text-gray-300 dark:text-gray-600'
                                }`}
                            >
                                <Star className="w-10 h-10 fill-current" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                        Share your experience
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        rows={4}
                        placeholder="How did it turn out? Any tips for others?"
                    />
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                        Share a photo
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 transition-colors hover:border-purple-500 dark:hover:border-purple-600">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload"
                        />
                        <label
                            htmlFor="image-upload"
                            className="cursor-pointer flex flex-col items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                            <ImageIcon className="w-8 h-8" />
                            <span className="text-center">
                                {image ? image.name : 'Click to upload your creation'}
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Right Column - Pantry Update */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Update Pantry
                    </h3>
                    <button
                        onClick={() => setIsAddingNew(!isAddingNew)}
                        className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-sm"
                    >
                        {isAddingNew ? 'Cancel' : 'Add New Item'}
                    </button>
                </div>

                {/* Add New Item Section */}
                {isAddingNew && (
                    <div className="bg-purple-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search ingredients..."
                                className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <Search className="absolute right-4 top-3.5 text-gray-400 dark:text-gray-500 w-5 h-5" />
                        </div>

                        {searchResults.length > 0 && (
                            <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                {searchResults.map(ingredient => (
                                    <div
                                        key={ingredient.id}
                                        onClick={() => setSelectedIngredient(ingredient)}
                                        className={`p-2.5 cursor-pointer transition-colors ${
                                            selectedIngredient?.id === ingredient.id
                                                ? 'bg-purple-100 dark:bg-gray-700'
                                                : 'hover:bg-purple-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <span className="mr-2">
                                            {getIngredientEmoji(ingredient.name.toLowerCase())}
                                        </span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {ingredient.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedIngredient && (
                            <div className="flex gap-3 items-center">
                                <input
                                    type="number"
                                    value={newItemQuantity}
                                    onChange={(e) => setNewItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                    className="w-20 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <select
                                    value={newItemUnit}
                                    onChange={(e) => setNewItemUnit(e.target.value as MeasurementUnit)}
                                    className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    {measurementUnits.map(unit => (
                                        <option 
                                            key={unit} 
                                            value={unit}
                                            className="dark:bg-gray-800"
                                        >
                                            {unit.toLowerCase()}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => handleAddNewIngredient(selectedIngredient)}
                                    className="ml-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Existing Pantry Items */}
                {loading ? (
                    <div className="text-center py-8 space-y-2">
                        <div className="animate-spin inline-block text-3xl text-purple-600 dark:text-purple-400">🔄</div>
                        <p className="text-gray-600 dark:text-gray-400">Loading pantry items...</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        <AnimatePresence>
                            {pantryItems && pantryItems.map(item => (
                                <motion.div
                                    key={item.ingredient.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="group flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                            <span className="text-2xl">
                                                {getIngredientEmoji(item.ingredient.name.toLowerCase())}
                                            </span>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">
                                                {item.ingredient.name}
                                            </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border dark:border-gray-700">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.ingredient.id, Math.max(0, item.quantity - 1), item.measurementUnit)}
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                            >
                                                <Minus size={16} className="text-purple-600 dark:text-purple-400" />
                                            </button>

                                            <span className="text-sm font-mono text-purple-600 dark:text-purple-400 min-w-[40px] text-center">
                                                    {item.quantity}
                                                </span>

                                            <button
                                                onClick={() => handleUpdateQuantity(item.ingredient.id, item.quantity + 1, item.measurementUnit)}
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                            >
                                                <Plus size={16} className="text-purple-600 dark:text-purple-400" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveIngredient(item.ingredient.id)}
                                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} className="text-red-500 dark:text-red-400" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {pantryItems.length === 0 && (
                            <div className="text-center py-6 text-gray-500 dark:text-gray-400 italic">
                                Your pantry is currently empty
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {error && (
            <div className="mt-6 p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg border border-red-500/20">
                {error}
            </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
            {showSkipButton && (
                <button
                    onClick={onClose}
                    className="px-5 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                    Skip Review
                </button>
            )}
            <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors transform hover:scale-105"
            >
                Submit Review
            </button>
        </div>
        {showSuccess && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
                Review submitted successfully! 🎉
            </div>
        )}
    </div>
</div>
    );
};

export default ReviewModal;
